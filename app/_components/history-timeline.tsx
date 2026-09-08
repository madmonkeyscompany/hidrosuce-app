"use client";

import { useState } from "react";
import { formatBRL, formatDateBR, TYPE_LABEL, type MaintenanceRecord } from "@/lib/types";

const PAGE = 20;

export function HistoryTimeline({
  records,
  showValue = true,
}: {
  records: MaintenanceRecord[];
  showValue?: boolean;
}) {
  const [visible, setVisible] = useState(PAGE);

  if (records.length === 0) {
    return (
      <div className="card p-10 text-center text-[color:var(--color-muted)]">
        Nenhuma manutenção registrada ainda para este equipamento.
      </div>
    );
  }

  return (
    <>
    <ol className="relative border-l border-[color:var(--color-line)] ml-1 grid gap-4">
      {records.map((r, i) => (
        <li key={r.id} className={`relative pl-5 ${i >= visible ? "hidden print:block" : ""}`}>
          <span className="absolute -left-[6px] top-2 h-2.5 w-2.5 rounded-full bg-[color:var(--color-blue)]" />
          <div className="card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className={`chip ${r.type === "preventiva" ? "chip-prev" : "chip-corr"}`}>
                {TYPE_LABEL[r.type]}
              </span>
              <div className="flex items-center gap-3 text-sm">
                <span className="font-medium">{formatDateBR(r.performed_at)}</span>
                {showValue && r.value_cents != null ? (
                  <span className="text-[color:var(--color-steel)]">{formatBRL(r.value_cents)}</span>
                ) : null}
              </div>
            </div>
            <p className="mt-2 text-sm whitespace-pre-wrap">{r.description}</p>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              {r.technician_name ? (
                <p className="text-xs text-[color:var(--color-muted)]">Técnico: {r.technician_name}</p>
              ) : (
                <span />
              )}
              {r.laudo_path ? (
                <a
                  href={`/laudo/${r.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[color:var(--color-blue-strong)] hover:underline"
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
                    <path d="M14 2v6h6" />
                  </svg>
                  Ver laudo (PDF)
                </a>
              ) : null}
            </div>
          </div>
        </li>
      ))}
    </ol>
    {records.length > visible ? (
      <button
        className="btn btn-outline btn-sm mt-4 no-print"
        onClick={() => setVisible((v) => v + PAGE)}
      >
        Carregar mais ({records.length - visible})
      </button>
    ) : null}
    </>
  );
}
