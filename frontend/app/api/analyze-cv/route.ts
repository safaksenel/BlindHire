import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

// ─── STAGE 1: Local Keyword Scoring Engine ──────────────────────────────
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[çÇ]/g, "c")
    .replace(/[ğĞ]/g, "g")
    .replace(/[ıİ]/g, "i")
    .replace(/[öÖ]/g, "o")
    .replace(/[şŞ]/g, "s")
    .replace(/[üÜ]/g, "u")
    .replace(/[^a-z0-9\s+#.]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text: string): string[] {
  return normalizeText(text).split(" ").filter((t) => t.length > 1);
}

function computeTFIDF(
  cvTokens: string[],
  requirements: string[]
): { score: number; matched: string[]; missed: string[] } {
  const cvText = normalizeText(cvTokens.join(" "));
  const cvSet = new Set(cvTokens);
  const matched: string[] = [];
  const missed: string[] = [];

  for (const req of requirements) {
    const normalizedReq = normalizeText(req);
    const reqTokens = normalizedReq.split(" ").filter((t) => t.length > 1);

    // Check exact phrase match first
    if (cvText.includes(normalizedReq)) {
      matched.push(req);
      continue;
    }

    // Then check token overlap (at least 60% of requirement tokens found)
    const matchCount = reqTokens.filter((t) => cvSet.has(t)).length;
    if (reqTokens.length > 0 && matchCount / reqTokens.length >= 0.6) {
      matched.push(req);
    } else {
      missed.push(req);
    }
  }

  const score =
    requirements.length > 0
      ? Math.round((matched.length / requirements.length) * 100)
      : 0;

  return { score, matched, missed };
}

// ─── STAGE 2: Groq LLM Deep Analysis ───────────────────────────────────
async function groqDeepAnalysis(
  cvText: string,
  requirements: string[]
): Promise<{
  finalScore: number;
  strengths: string[];
  weaknesses: string[];
  verdict: "PASSED" | "REJECTED";
}> {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  // Truncate CV to save tokens (first 3000 chars is enough for analysis)
  const truncatedCV = cvText.substring(0, 3000);

  const completion = await groq.chat.completions.create({
    model: "llama3-8b-8192",
    temperature: 0.1,
    max_tokens: 512,
    messages: [
      {
        role: "system",
        content:
          'You are a strict resume evaluator. Return ONLY valid JSON, no markdown, no explanation. Schema: {"finalScore":number,"strengths":[string],"weaknesses":[string],"verdict":"PASSED"|"REJECTED"}. finalScore 0-100. verdict is PASSED if finalScore>=70.',
      },
      {
        role: "user",
        content: `Evaluate this CV against the job requirements.\n\nJob Requirements: ${requirements.join(", ")}\n\nCV Text:\n${truncatedCV}`,
      },
    ],
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message?.content || "{}";
  const parsed = JSON.parse(raw);

  return {
    finalScore: typeof parsed.finalScore === "number" ? parsed.finalScore : 50,
    strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
    weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
    verdict: parsed.verdict === "PASSED" ? "PASSED" : "REJECTED",
  };
}

// ─── PDF Parser (dynamic import for Edge compat) ────────────────────────
async function parsePDF(buffer: Buffer): Promise<string> {
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  const result = await parser.getText();
  return result.text || "";
}

// ─── MAIN ROUTE ─────────────────────────────────────────────────────────
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const pdfFile = formData.get("pdfFile") as File | null;
    const jobRequirementsRaw = formData.get("jobRequirements") as string | null;

    if (!pdfFile || !jobRequirementsRaw) {
      return NextResponse.json(
        { error: "pdfFile and jobRequirements are required." },
        { status: 400 }
      );
    }

    // Parse requirements (accept JSON array or comma-separated string)
    let requirements: string[];
    try {
      requirements = JSON.parse(jobRequirementsRaw);
      if (!Array.isArray(requirements)) throw new Error();
    } catch {
      requirements = jobRequirementsRaw
        .split(",")
        .map((r) => r.trim())
        .filter(Boolean);
    }

    if (requirements.length === 0) {
      return NextResponse.json(
        { error: "At least one job requirement is needed." },
        { status: 400 }
      );
    }

    // ── Parse PDF ──
    const bytes = await pdfFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const cvText = await parsePDF(buffer);

    if (!cvText || cvText.trim().length < 20) {
      return NextResponse.json(
        { error: "Could not extract meaningful text from the PDF." },
        { status: 422 }
      );
    }

    // ── STAGE 1: Local Algorithmic Scoring ──
    const cvTokens = tokenize(cvText);
    const stage1 = computeTFIDF(cvTokens, requirements);

    console.log(
      `[ANALYZE-CV] Stage 1 Score: ${stage1.score}/100 | Matched: ${stage1.matched.length}/${requirements.length}`
    );

    // ── OPTIMIZATION GATE ──
    if (stage1.score < 75) {
      return NextResponse.json({
        pipeline: "STAGE_1_ONLY",
        status: "REJECTED",
        stageOneScore: stage1.score,
        matched: stage1.matched,
        missed: stage1.missed,
        reason:
          "Insufficient keyword match. CV does not meet the minimum requirement threshold.",
      });
    }

    // ── STAGE 2: Groq LLM Deep Analysis ──
    try {
      console.log("[ANALYZE-CV] Stage 1 passed. Invoking Groq LLM...");
      const stage2 = await groqDeepAnalysis(cvText, requirements);

      console.log(
        `[ANALYZE-CV] Stage 2 Score: ${stage2.finalScore}/100 | Verdict: ${stage2.verdict}`
      );

      return NextResponse.json({
        pipeline: "STAGE_2_COMPLETE",
        status: stage2.verdict,
        stageOneScore: stage1.score,
        finalScore: stage2.finalScore,
        strengths: stage2.strengths,
        weaknesses: stage2.weaknesses,
        matched: stage1.matched,
        missed: stage1.missed,
      });
    } catch (groqError) {
      // Groq failed → graceful fallback to Stage 1 result
      console.error("[ANALYZE-CV] Groq API failed, falling back:", groqError);

      return NextResponse.json({
        pipeline: "STAGE_2_FALLBACK",
        status: stage1.score >= 80 ? "PASSED" : "REJECTED",
        stageOneScore: stage1.score,
        finalScore: stage1.score,
        matched: stage1.matched,
        missed: stage1.missed,
        fallbackReason: "LLM analysis unavailable. Score based on keyword match only.",
      });
    }
  } catch (error) {
    console.error("[ANALYZE-CV] Critical error:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
