export type PaletteCategory = "standart" | "futuristik";

export type Palette = {
  id: number;
  name: string;
  category: PaletteCategory;
  colors: [string, string, string, string, string];
};

export const PALETTES: Palette[] = [
  { id: 101, name: "Kurumsal Mavi", category: "standart", colors: ["#FFFFFF", "#60A5FA", "#3B82F6", "#1E3A8A", "#0F172A"] },
  { id: 1, name: "Siber Güven", category: "futuristik", colors: ["#00E5FF", "#0284C7", "#0369A1", "#040F2D", "#020617"] },
  { id: 2, name: "Kuzey Işıkları", category: "futuristik", colors: ["#25E5CD", "#8B5CF6", "#6D28D9", "#1E1B4B", "#0B081F"] },
  { id: 3, name: "Zümrüt Matrisi", category: "futuristik", colors: ["#10B981", "#059669", "#047857", "#06271E", "#02110D"] },
  { id: 4, name: "Likit Altın", category: "futuristik", colors: ["#FFC300", "#D97706", "#B45309", "#451A03", "#1C0A00"] },
  { id: 5, name: "Kızıl Ateş", category: "futuristik", colors: ["#FF4D4D", "#E11D48", "#9F1239", "#4C0519", "#1A0005"] },
  { id: 6, name: "Derin Uzay", category: "futuristik", colors: ["#E05DFF", "#C026D3", "#86198F", "#31043D", "#0A0014"] },
  { id: 7, name: "Güneş Patlaması", category: "futuristik", colors: ["#FF8400", "#DC2626", "#991B1B", "#450A0A", "#170101"] },
  { id: 8, name: "Kuantum Menekşe", category: "futuristik", colors: ["#FF3399", "#D9006C", "#6B0036", "#2B0021", "#10000C"] },
  { id: 9, name: "Okyanus Uçurumu", category: "futuristik", colors: ["#22B4FF", "#0284C7", "#0369A1", "#0C4A6E", "#041528"] },
  { id: 11, name: "Neon Bakır", category: "futuristik", colors: ["#00E5FF", "#EA580C", "#C2410C", "#00A896", "#0B1310"] },
  { id: 12, name: "Mistik Mercan", category: "futuristik", colors: ["#FFFFFF", "#D94CDA", "#E94125", "#2D4878", "#170B20"] },
  { id: 13, name: "Kor Gelgit", category: "futuristik", colors: ["#304C64", "#26788E", "#A4CCD4", "#E2480C", "#631B08"] },
  { id: 14, name: "Tropik Camgöbeği", category: "futuristik", colors: ["#FF7A1A", "#EA580C", "#004853", "#007e80", "#00b9bd"] },
  { id: 16, name: "Palette 4241", category: "futuristik", colors: ["#FF4081", "#F59E0B", "#4DB6AC", "#4A148C", "#2D1C2E"] },
  { id: 17, name: "Neon Galaksi", category: "futuristik", colors: ["#FF114F", "#DB2777", "#D946EF", "#7904EB", "#110458"] },
  { id: 18, name: "Biyolüminesan", category: "futuristik", colors: ["#D4FF1A", "#D946EF", "#00E5FF", "#3D0099", "#0A0014"] }
];
