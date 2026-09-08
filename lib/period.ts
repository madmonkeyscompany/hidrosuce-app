const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

export const PERIOD_OPTIONS = [
  { value: "ano", label: "Este ano" },
  { value: "3m", label: "3 meses" },
  { value: "12m", label: "12 meses" },
  { value: "anterior", label: "Ano passado" },
] as const;

export type PeriodValue = (typeof PERIOD_OPTIONS)[number]["value"];

export type ResolvedPeriod = {
  value: PeriodValue;
  title: string; // ex.: "2026", "últimos 3 meses"
  months: { key: string; label: string }[]; // key = "YYYY-MM"
  keys: Set<string>;
};

// Resolve o período selecionado em uma lista de meses (pro gráfico) + um Set
// de chaves "YYYY-MM" (pra filtrar os registros).
export function resolvePeriod(periodo: string | undefined, now: Date): ResolvedPeriod {
  const y = now.getFullYear();
  const m = now.getMonth(); // 0-based
  const value: PeriodValue = (["ano", "3m", "12m", "anterior"] as const).includes(
    periodo as PeriodValue,
  )
    ? (periodo as PeriodValue)
    : "ano";

  const months: { key: string; label: string }[] = [];
  const add = (yy: number, mm: number) =>
    months.push({ key: `${yy}-${String(mm + 1).padStart(2, "0")}`, label: MONTHS[mm] });

  let title = String(y);
  if (value === "anterior") {
    for (let i = 0; i < 12; i++) add(y - 1, i);
    title = String(y - 1);
  } else if (value === "3m") {
    for (let i = 2; i >= 0; i--) {
      const d = new Date(y, m - i, 1);
      add(d.getFullYear(), d.getMonth());
    }
    title = "últimos 3 meses";
  } else if (value === "12m") {
    for (let i = 11; i >= 0; i--) {
      const d = new Date(y, m - i, 1);
      add(d.getFullYear(), d.getMonth());
    }
    title = "últimos 12 meses";
  } else {
    for (let i = 0; i <= m; i++) add(y, i);
    title = String(y);
  }

  return { value, title, months, keys: new Set(months.map((x) => x.key)) };
}
