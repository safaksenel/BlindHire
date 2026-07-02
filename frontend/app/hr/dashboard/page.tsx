import { Briefcase, FileSearch, Trophy, ArrowUpRight, TrendingUp } from "lucide-react";

interface MetricCardData {
  readonly label: string;
  readonly value: string;
  readonly change: string;
  readonly icon: React.ReactNode;
  readonly accentColor: string;
  readonly accentBg: string;
}

const METRICS: readonly MetricCardData[] = [
  {
    label: "Aktif İlanlar",
    value: "3",
    change: "+1 bu hafta",
    icon: <Briefcase className="h-4 w-4" />,
    accentColor: "text-blue-400",
    accentBg: "from-blue-500/15 to-blue-600/15",
  },
  {
    label: "İncelenen CV",
    value: "1.204",
    change: "+89 bugün",
    icon: <FileSearch className="h-4 w-4" />,
    accentColor: "text-purple-400",
    accentBg: "from-purple-500/15 to-purple-600/15",
  },
  {
    label: "Mülakatı Geçen",
    value: "42",
    change: "%3.5 başarı oranı",
    icon: <Trophy className="h-4 w-4" />,
    accentColor: "text-emerald-400",
    accentBg: "from-emerald-500/15 to-emerald-600/15",
  },
] as const;

interface JobRow {
  readonly position: string;
  readonly department: string;
  readonly credits: number;
  readonly successRate: string;
  readonly trend: "up" | "stable";
}

const JOBS: readonly JobRow[] = [
  { position: "Senior Frontend Engineer", department: "Mühendislik", credits: 47, successRate: "%4.1", trend: "up" },
  { position: "DevOps / SRE", department: "Altyapı", credits: 23, successRate: "%6.2", trend: "up" },
  { position: "Product Designer", department: "Ürün", credits: 81, successRate: "%2.8", trend: "stable" },
] as const;

export default function DashboardPage(): React.JSX.Element {
  return (
    <div className="space-y-8">
      {/* ── Page header ── */}
      <div>
        <h1 className="text-xl font-bold text-white">Gösterge Paneli</h1>
        <p className="mt-1 text-sm text-white/30">
          AI işe alım süreçlerinizin gerçek zamanlı özeti.
        </p>
      </div>

      {/* ── Metric cards ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {METRICS.map((metric) => (
          <div
            key={metric.label}
            className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.015] p-5 transition-all duration-300 hover:border-white/[0.1] hover:bg-white/[0.025]"
          >
            {/* Subtle gradient background */}
            <div
              className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${metric.accentBg} opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100`}
            />

            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${metric.accentBg} ${metric.accentColor}`}
                >
                  {metric.icon}
                </div>
                <ArrowUpRight className="h-4 w-4 text-white/10 transition-colors group-hover:text-white/25" />
              </div>
              <p className="mt-4 text-2xl font-bold tracking-tight text-white">
                {metric.value}
              </p>
              <div className="mt-1.5 flex items-center justify-between">
                <p className="text-xs text-white/30">{metric.label}</p>
                <p className={`text-[10px] font-medium ${metric.accentColor} opacity-60`}>
                  {metric.change}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Jobs table ── */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015]">
        {/* Table header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
          <div>
            <h2 className="text-sm font-semibold text-white">
              Aktif İş İlanları
            </h2>
            <p className="mt-0.5 text-xs text-white/20">
              AI tarafından yönetilen açık pozisyonlar
            </p>
          </div>
          <span className="rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1 text-[10px] font-medium text-white/30">
            {JOBS.length} ilan
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.04]">
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-white/20">
                  Pozisyon
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-white/20">
                  Departman
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-white/20">
                  Kalan Kredi
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-white/20">
                  Başarı Oranı
                </th>
              </tr>
            </thead>
            <tbody>
              {JOBS.map((job) => (
                <tr
                  key={job.position}
                  className="border-b border-white/[0.03] transition-colors last:border-0 hover:bg-white/[0.02]"
                >
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-white/70">
                      {job.position}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-md border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-xs text-white/40">
                      {job.department}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/[0.04]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500/60 to-purple-500/60"
                          style={{ width: `${Math.min((job.credits / 100) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-white/40">
                        {job.credits}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      {job.trend === "up" && (
                        <TrendingUp className="h-3 w-3 text-emerald-400/60" />
                      )}
                      <span className="text-xs font-medium text-emerald-400/70">
                        {job.successRate}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
