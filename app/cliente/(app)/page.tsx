import Link from "next/link";
import { getSession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";
import { formatDateBR, type MaintType } from "@/lib/types";
import { resolvePeriod } from "@/lib/period";
import { PeriodPicker } from "@/app/_components/period-picker";

export const dynamic = "force-dynamic";

function brl0(cents: number): string {
  return "R$ " + Math.round(cents / 100).toLocaleString("pt-BR");
}
function compact(cents: number): string {
  const reais = cents / 100;
  if (reais <= 0) return "";
  if (reais >= 1000) return (reais / 1000).toFixed(1).replace(".", ",") + "k";
  return String(Math.round(reais));
}

type EquipRow = {
  id: string;
  label: string | null;
  serial_number: string;
  brand: string | null;
  model: string | null;
  created_at: string;
};
type Rec = {
  equipment_id: string;
  type: MaintType;
  value_cents: number | null;
  performed_at: string;
};

export default async function ClienteHome({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string }>;
}) {
  const session = await getSession();
  if (session?.role !== "client") return null;
  const { periodo } = await searchParams;
  const supa = supabaseAdmin();

  const { data: equipData } = await supa
    .from("equipment")
    .select("id, label, serial_number, brand, model, created_at")
    .eq("client_id", session.clientId)
    .order("created_at", { ascending: false });
  const equipment = (equipData ?? []) as EquipRow[];
  const equipIds = equipment.map((e) => e.id);

  let records: Rec[] = [];
  if (equipIds.length) {
    const { data: recData } = await supa
      .from("maintenance_records")
      .select("equipment_id, type, value_cents, performed_at")
      .in("equipment_id", equipIds);
    records = (recData ?? []) as Rec[];
  }

  const now = new Date();
  const period = resolvePeriod(periodo, now);
  const periodRecords = records.filter((r) => period.keys.has(r.performed_at.slice(0, 7)));

  const invested = periodRecords.reduce((s, r) => s + (r.value_cents ?? 0), 0);
  const prevCount = periodRecords.filter((r) => r.type === "preventiva").length;
  const corrCount = periodRecords.filter((r) => r.type === "corretiva").length;
  const total = periodRecords.length;
  const prevPct = total ? Math.round((prevCount / total) * 100) : 0;
  const corrPct = total ? 100 - prevPct : 0;

  const monthly = period.months.map((mo) => ({
    label: mo.label,
    cents: periodRecords
      .filter((r) => r.performed_at.slice(0, 7) === mo.key)
      .reduce((s, r) => s + (r.value_cents ?? 0), 0),
  }));
  const maxMonthly = Math.max(1, ...monthly.map((m) => m.cents));

  const equipStats = equipment.map((e) => {
    const recs = records.filter((r) => r.equipment_id === e.id);
    const last = recs.reduce<string | null>(
      (acc, r) => (acc && acc >= r.performed_at ? acc : r.performed_at),
      null,
    );
    const spent = periodRecords
      .filter((r) => r.equipment_id === e.id)
      .reduce((s, r) => s + (r.value_cents ?? 0), 0);
    return { ...e, last, spent };
  });

  if (equipment.length === 0) {
    return (
      <div>
        <h1 className="font-display text-3xl tracking-wide">SUA FROTA</h1>
        <p className="text-sm text-[color:var(--color-muted)] mb-6">{session.clientName}</p>
        <div className="card p-10 text-center text-[color:var(--color-muted)]">
          Nenhum equipamento cadastrado ainda. Fale com a Hidro Suce.
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-3xl tracking-wide">SUA FROTA</h1>
      <p className="text-sm text-[color:var(--color-muted)] mb-4">
        Acompanhamento de manutenção · {period.title}
      </p>

      <PeriodPicker path="/cliente" current={period.value} />

      {/* KPIs */}
      <div className="kpis">
        <div className="kpi">
          <div className="k-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="M3.3 7 12 12l8.7-5" /><path d="M12 22V12" /></svg>
          </div>
          <div className="k-label">Equipamentos</div>
          <div className="k-value">{equipment.length}</div>
          <div className="k-foot">monitorados</div>
        </div>
        <div className="kpi">
          <div className="k-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>
          </div>
          <div className="k-label">Investido</div>
          <div className="k-value">
            <span className="cur">R$</span>
            {compact(invested) || "0"}
          </div>
          <div className="k-foot">no período</div>
        </div>
        <div className="kpi" style={{ "--kc": "var(--color-ok)" } as React.CSSProperties}>
          <div className="k-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="m9 12 2 2 4-4" /></svg>
          </div>
          <div className="k-label">Preventiva</div>
          <div className="k-value ok">{prevPct}%</div>
          <div className="k-foot">das manutenções</div>
        </div>
        <div className="kpi">
          <div className="k-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
          </div>
          <div className="k-label">Manutenções</div>
          <div className="k-value">{total}</div>
          <div className="k-foot">no período</div>
        </div>
      </div>

      {/* Investimento por mês */}
      <div className="card p-5 mt-4">
        <div className="flex items-baseline justify-between mb-1">
          <h2 className="font-display text-lg tracking-wide">Investimento por mês</h2>
          <span className="text-xs text-[color:var(--color-faint)]">R$ · {period.title}</span>
        </div>
        <div className="chart">
          {monthly.map((m, i) => (
            <div key={m.label + i} className="bar-col" title={`${m.label} · ${brl0(m.cents)}`}>
              <span className="bar-val">{compact(m.cents)}</span>
              <div
                className="bar"
                style={{ height: `${m.cents > 0 ? Math.max(4, (m.cents / maxMonthly) * 100) : 2}%` }}
              />
              <span className="bar-m">{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Preventiva x Corretiva */}
      <div className="card p-5 mt-4">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="font-display text-lg tracking-wide">Preventiva × Corretiva</h2>
          <span className="text-xs text-[color:var(--color-faint)]">{total} manutenções</span>
        </div>
        {total === 0 ? (
          <p className="text-sm text-[color:var(--color-muted)]">Sem manutenções no período.</p>
        ) : (
          <div className="grid gap-3">
            <div className="split-bar">
              {prevCount > 0 ? (
                <div className="seg-prev" style={{ flex: prevPct || 1 }} title={`Preventiva · ${prevCount}`} />
              ) : null}
              {corrCount > 0 ? (
                <div className="seg-corr" style={{ flex: corrPct || 1 }} title={`Corretiva · ${corrCount}`} />
              ) : null}
            </div>
            <div className="split-legend">
              <span className="lg"><span className="dot" style={{ background: "var(--color-ok)" }} /> Preventiva <b>{prevCount} · {prevPct}%</b></span>
              <span className="lg"><span className="dot" style={{ background: "var(--color-warn)" }} /> Corretiva <b>{corrCount} · {corrPct}%</b></span>
            </div>
            {prevPct >= 60 ? (
              <p className="text-sm text-[color:var(--color-steel)]">
                Sua frota rodou o período quase todo em manutenção preventiva — poucas paradas não planejadas.
              </p>
            ) : null}
          </div>
        )}
      </div>

      {/* Equipamentos */}
      <div className="card p-5 mt-4">
        <div className="flex items-baseline justify-between mb-1">
          <h2 className="font-display text-lg tracking-wide">Meus equipamentos</h2>
          <span className="text-xs text-[color:var(--color-faint)]">toque para ver o histórico</span>
        </div>
        <div>
          {equipStats.map((e) => (
            <Link
              key={e.id}
              href={`/cliente/equipamento/${e.id}`}
              className="flex items-center justify-between gap-3 py-3.5 border-t border-[color:var(--color-line)] first:border-t-0"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span className="font-medium">{e.label || "Equipamento"}</span>
                  <span className="font-mono text-[11px] text-[color:var(--color-blue-strong)]">{e.serial_number}</span>
                </div>
                <div className="text-xs text-[color:var(--color-muted)] mt-0.5">
                  {[e.brand, e.model].filter(Boolean).join(" · ") || "—"}
                  {e.last ? ` — última em ${formatDateBR(e.last)}` : " — sem manutenções"}
                </div>
              </div>
              <div className="text-right shrink-0 flex items-center gap-2">
                <div>
                  <div className="text-sm font-semibold tabular-nums">{brl0(e.spent)}</div>
                  <div className="text-[11px] text-[color:var(--color-faint)]">no período</div>
                </div>
                <span className="text-[color:var(--color-faint)]">›</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
