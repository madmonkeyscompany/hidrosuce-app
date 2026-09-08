import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";
import { TYPE_LABEL, formatDateBR, type MaintType } from "@/lib/types";
import { resolvePeriod } from "@/lib/period";
import { PeriodPicker } from "@/app/_components/period-picker";

export const dynamic = "force-dynamic";

function compactK(cents: number): string {
  const reais = cents / 100;
  if (reais >= 1000) return (reais / 1000).toFixed(1).replace(".", ",") + "k";
  return String(Math.round(reais));
}

type Rec = {
  equipment_id: string;
  type: MaintType;
  value_cents: number | null;
  performed_at: string;
  technician_name: string | null;
  created_at: string;
};

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string }>;
}) {
  const session = await getSession();
  if (session?.role !== "super_admin") redirect("/admin/clientes");
  const { periodo } = await searchParams;
  const supa = supabaseAdmin();

  const [clientsRes, equipRes, recRes] = await Promise.all([
    supa.from("clients").select("id, name"),
    supa.from("equipment").select("id, client_id, label"),
    supa
      .from("maintenance_records")
      .select("equipment_id, type, value_cents, performed_at, technician_name, created_at"),
  ]);

  const clients = (clientsRes.data ?? []) as { id: string; name: string }[];
  const equipment = (equipRes.data ?? []) as { id: string; client_id: string; label: string | null }[];
  const records = (recRes.data ?? []) as Rec[];

  const clientName = new Map(clients.map((c) => [c.id, c.name]));
  const equipInfo = new Map(equipment.map((e) => [e.id, { clientId: e.client_id, label: e.label }]));

  const now = new Date();
  const period = resolvePeriod(periodo, now);
  const periodRecords = records.filter((r) => period.keys.has(r.performed_at.slice(0, 7)));

  const revenue = periodRecords.reduce((s, r) => s + (r.value_cents ?? 0), 0);
  const maintCount = periodRecords.length;

  const monthly = period.months.map((mo) => ({
    label: mo.label,
    cents: periodRecords
      .filter((r) => r.performed_at.slice(0, 7) === mo.key)
      .reduce((s, r) => s + (r.value_cents ?? 0), 0),
  }));
  const maxMonthly = Math.max(1, ...monthly.map((m) => m.cents));

  const perClient = new Map<string, number>();
  for (const r of periodRecords) {
    const info = equipInfo.get(r.equipment_id);
    if (!info) continue;
    perClient.set(info.clientId, (perClient.get(info.clientId) ?? 0) + (r.value_cents ?? 0));
  }
  const topClients = [...perClient.entries()]
    .map(([cid, cents]) => ({ name: clientName.get(cid) ?? "—", cents }))
    .sort((a, b) => b.cents - a.cents)
    .slice(0, 5);
  const topMax = Math.max(1, ...topClients.map((t) => t.cents));

  const recent = [...records]
    .sort((a, b) =>
      a.performed_at < b.performed_at
        ? 1
        : a.performed_at > b.performed_at
          ? -1
          : a.created_at < b.created_at
            ? 1
            : -1,
    )
    .slice(0, 6)
    .map((r) => {
      const info = equipInfo.get(r.equipment_id);
      return {
        client: info ? (clientName.get(info.clientId) ?? "—") : "—",
        label: info?.label ?? "Equipamento",
        type: r.type,
        value: r.value_cents,
        date: r.performed_at,
      };
    });

  const perTech = new Map<string, { count: number; cents: number }>();
  for (const r of periodRecords) {
    const t = r.technician_name || "—";
    const cur = perTech.get(t) ?? { count: 0, cents: 0 };
    cur.count++;
    cur.cents += r.value_cents ?? 0;
    perTech.set(t, cur);
  }
  const techs = [...perTech.entries()]
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.count - a.count);

  return (
    <div>
      <h1 className="font-display text-3xl tracking-wide">OPERAÇÃO</h1>
      <p className="text-sm text-[color:var(--color-muted)] mb-4">Visão geral · {period.title}</p>

      <PeriodPicker path="/admin" current={period.value} />

      {/* KPIs */}
      <div className="kpis">
        <div className="kpi">
          <div className="k-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>
          </div>
          <div className="k-label">Receita</div>
          <div className="k-value"><span className="cur">R$</span>{compactK(revenue)}</div>
          <div className="k-foot">no período</div>
        </div>
        <div className="kpi">
          <div className="k-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" /><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" /><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" /><path d="M10 6h4M10 10h4M10 14h4" /></svg>
          </div>
          <div className="k-label">Clientes</div>
          <div className="k-value">{clients.length}</div>
          <div className="k-foot">ativos</div>
        </div>
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
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
          </div>
          <div className="k-label">Manutenções</div>
          <div className="k-value">{maintCount}</div>
          <div className="k-foot">no período</div>
        </div>
      </div>

      {/* Receita por mês */}
      <div className="card p-5 mt-4">
        <div className="flex items-baseline justify-between mb-1">
          <h2 className="font-display text-lg tracking-wide">Receita por mês</h2>
          <span className="text-xs text-[color:var(--color-faint)]">R$ · {period.title}</span>
        </div>
        <div className="chart">
          {monthly.map((m, i) => (
            <div key={m.label + i} className="bar-col" title={`${m.label} · R$ ${compactK(m.cents)}`}>
              <span className="bar-val">{m.cents > 0 ? compactK(m.cents) : ""}</span>
              <div className="bar" style={{ height: `${m.cents > 0 ? Math.max(4, (m.cents / maxMonthly) * 100) : 2}%` }} />
              <span className="bar-m">{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top clientes */}
      {topClients.length > 0 ? (
        <div className="card p-5 mt-4">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="font-display text-lg tracking-wide">Top clientes</h2>
            <span className="text-xs text-[color:var(--color-faint)]">por receita · {period.title}</span>
          </div>
          {topClients.map((c, i) => (
            <div key={c.name + i} className="rank-row">
              <div className="rank-head">
                <span className="rank-name"><span className="r-pos">{i + 1}</span>{c.name}</span>
                <span className="rank-val">R$ {compactK(c.cents)}</span>
              </div>
              <div className="rank-track">
                <div className="rank-fill" style={{ width: `${(c.cents / topMax) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* Atividade recente */}
      <div className="card p-5 mt-4">
        <div className="flex items-baseline justify-between mb-1">
          <h2 className="font-display text-lg tracking-wide">Atividade recente</h2>
          <span className="text-xs text-[color:var(--color-faint)]">últimas manutenções</span>
        </div>
        {recent.length === 0 ? (
          <p className="text-sm text-[color:var(--color-muted)] mt-2">Nenhuma manutenção registrada ainda.</p>
        ) : (
          recent.map((a, i) => (
            <div key={i} className="feed-row">
              <div className="feed-main">
                <div className="f-title">{a.client} · {a.label}</div>
                <div className="f-sub">
                  <span className={`chip ${a.type === "preventiva" ? "chip-prev" : "chip-corr"}`}>
                    {TYPE_LABEL[a.type]}
                  </span>
                </div>
              </div>
              <div className="feed-right">
                {a.value != null ? (
                  <div className="f-val">R$ {Math.round(a.value / 100).toLocaleString("pt-BR")}</div>
                ) : null}
                <div className="f-date">{formatDateBR(a.date)}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Produtividade por técnico */}
      {techs.length > 0 ? (
        <div className="card p-5 mt-4">
          <div className="flex items-baseline justify-between mb-1">
            <h2 className="font-display text-lg tracking-wide">Produtividade por técnico</h2>
            <span className="text-xs text-[color:var(--color-faint)]">{period.title}</span>
          </div>
          {techs.map((t) => (
            <div key={t.name} className="tech-row">
              <div className="tech-l">
                <div className="avatar">{t.name.charAt(0).toUpperCase()}</div>
                <div>
                  <div className="tech-name">{t.name}</div>
                  <div className="tech-sub">{t.count} {t.count === 1 ? "manutenção" : "manutenções"}</div>
                </div>
              </div>
              <div className="tech-val">R$ {compactK(t.cents)}</div>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-6 text-center">
        <Link
          href="/admin/log"
          className="text-sm text-[color:var(--color-muted)] hover:text-white underline-offset-4 hover:underline"
        >
          Ver registro de alterações →
        </Link>
      </div>
    </div>
  );
}
