import fs from "fs";
import path from "path";

const DB_FILE = path.join(process.cwd(), "db.json");

interface HRSettings {
  companyId: string;
  autoInviteThreshold: number;
  manualReviewThreshold: number;
  autoRejectThreshold: number;
}

interface DBData {
  companies: any[];
  users: any[];
  jobPostings: any[];
  applications: any[];
  hrSettings: HRSettings[];
}

export function readDB(): DBData {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initial: DBData = { companies: [], users: [], jobPostings: [], applications: [], hrSettings: [] };
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), "utf8");
      return initial;
    }
    const raw = fs.readFileSync(DB_FILE, "utf8");
    const parsed = JSON.parse(raw);
    
    if (!parsed.jobPostings) parsed.jobPostings = [];
    if (!parsed.applications) parsed.applications = [];
    if (!parsed.hrSettings) parsed.hrSettings = [];
    
    return parsed;
  } catch {
    return { companies: [], users: [], jobPostings: [], applications: [], hrSettings: [] };
  }
}

export function writeDB(data: DBData): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("DB write error:", err);
  }
}
