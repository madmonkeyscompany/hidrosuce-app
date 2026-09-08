"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/app/_components/modal";
import { IconEdit } from "@/app/_components/icons";
import { updateRecordAction, deleteRecordAction, type ActionState } from "../../../actions";
import { TYPE_LABEL, formatBRL, formatDateBR, type MaintenanceRecord } from "@/lib/types";

function centsToInput(cents: number | null): string {
  if (cents == null) return "";
  return (cents / 100).toFixed(2).replace(".", ",");
}

export function RecordRow({
  record,
  equipmentId,
  currentName,
  staffNames,
  isSuper,
}: {
  record: MaintenanceRecord;
  equipmentId: string;
  currentName: string;
  staffNames: string[];
  isSuper: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [upState, upAction, upPending] = useActionState<ActionState, FormData>(
    updateRecordAction,
    null,
  );
  const [delState, delAction, delPending] = useActionState<ActionState, FormData>(
    deleteRecordAction,
    null,
  );

  useEffect(() => {
    if (upState?.ok) {
      setOpen(false);
      toast.success("Registro atualizado.");
    }
  }, [upState]);

  const techOptions = Array.from(
    new Set([record.technician_name, currentName, ...staffNames].filter(Boolean) as string[]),
  );

  return (
    <li className="relative pl-5">
      <span className="absolute -left-[6px] top-2 h-2.5 w-2.5 rounded-full bg-[color:var(--color-blue)]" />
      <div className="card p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className={`chip ${record.type === "preventiva" ? "chip-prev" : "chip-corr"}`}>
            {TYPE_LABEL[record.type]}
          </span>
          <div className="flex items-center gap-3 text-sm">
            <span className="font-medium">{formatDateBR(record.performed_at)}</span>
            {isSuper && record.value_cents != null ? (
              <span className="text-[color:var(--color-steel)]">{formatBRL(record.value_cents)}</span>
            ) : null}
            <button className="icon-btn" onClick={() => setOpen(true)} aria-label="Editar registro">
              <IconEdit />
            </button>
          </div>
        </div>
        <p className="mt-2 text-sm whitespace-pre-wrap">{record.description}</p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          {record.technician_name ? (
            <p className="text-xs text-[color:var(--color-muted)]">Técnico: {record.technician_name}</p>
          ) : (
            <span />
          )}
          {record.laudo_path ? (
            <a
              href={`/laudo/${record.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-[color:var(--color-blue-strong)] hover:underline"
            >
              Ver laudo (PDF)
            </a>
          ) : null}
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="EDITAR MANUTENÇÃO">
        <form action={upAction} className="grid gap-4">
          <input type="hidden" name="id" value={record.id} />
          <input type="hidden" name="equipment_id" value={equipmentId} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor={`t-${record.id}`}>Tipo *</label>
              <select id={`t-${record.id}`} name="type" className="field" defaultValue={record.type} required>
                <option value="preventiva">Preventiva</option>
                <option value="corretiva">Corretiva</option>
              </select>
            </div>
            <div>
              <label className="label" htmlFor={`d-${record.id}`}>Data *</label>
              <input id={`d-${record.id}`} name="performed_at" type="date" className="field" defaultValue={record.performed_at.slice(0, 10)} required />
            </div>
            {isSuper ? (
              <div>
                <label className="label" htmlFor={`v-${record.id}`}>Valor (R$)</label>
                <input id={`v-${record.id}`} name="value" className="field" inputMode="decimal" defaultValue={centsToInput(record.value_cents)} placeholder="1.500,00" />
              </div>
            ) : null}
            <div>
              <label className="label" htmlFor={`tec-${record.id}`}>Técnico</label>
              {isSuper ? (
                <select id={`tec-${record.id}`} name="technician_name" className="field" defaultValue={record.technician_name ?? currentName}>
                  {techOptions.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              ) : (
                <input className="field" value={record.technician_name ?? currentName} disabled />
              )}
            </div>
          </div>
          <div>
            <label className="label" htmlFor={`desc-${record.id}`}>Descrição *</label>
            <textarea id={`desc-${record.id}`} name="description" className="field" rows={4} defaultValue={record.description} required />
          </div>

          <div>
            <label className="label" htmlFor={`laudo-${record.id}`}>Laudo em PDF</label>
            {record.laudo_path ? (
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <a href={`/laudo/${record.id}`} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-[color:var(--color-blue-strong)] hover:underline">
                  Ver laudo atual
                </a>
                <label className="text-xs text-[color:var(--color-muted)] flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" name="remove_laudo" value="1" /> Remover laudo
                </label>
              </div>
            ) : null}
            <input
              id={`laudo-${record.id}`}
              name="laudo"
              type="file"
              accept="application/pdf,.pdf"
              className="field text-sm file:mr-3 file:rounded-md file:border-0 file:cursor-pointer file:px-3 file:py-1.5 file:text-white file:bg-[var(--color-blue-dark)]"
              style={{ paddingTop: "0.45rem" }}
            />
            <p className="text-[11px] text-[color:var(--color-faint)] mt-1">
              {record.laudo_path ? "Escolha um PDF para substituir o atual." : "Anexe o laudo em PDF (opcional)."}
            </p>
          </div>

          {upState?.error ? (
            <p className="text-sm text-[color:var(--color-magenta)]">{upState.error}</p>
          ) : null}

          <div className="flex gap-2">
            <button className="btn btn-primary" disabled={upPending}>
              {upPending ? "Salvando…" : "Salvar"}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
              Cancelar
            </button>
          </div>
        </form>

        <div className="border-t border-[color:var(--color-line)] mt-5 pt-4">
          {delState?.error ? (
            <p className="text-sm text-[color:var(--color-magenta)] mb-2">{delState.error}</p>
          ) : null}
          {confirming ? (
            <form action={delAction} className="flex items-center gap-2">
              <input type="hidden" name="id" value={record.id} />
              <input type="hidden" name="equipment_id" value={equipmentId} />
              <span className="text-sm text-[color:var(--color-muted)]">Apagar este registro?</span>
              <button className="btn btn-sm" style={{ background: "var(--color-magenta)", color: "white" }} disabled={delPending}>
                {delPending ? "…" : "Sim, apagar"}
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirming(false)}>
                Não
              </button>
            </form>
          ) : (
            <button
              type="button"
              className="text-sm text-[color:var(--color-magenta)] hover:underline"
              onClick={() => setConfirming(true)}
            >
              Apagar registro
            </button>
          )}
        </div>
      </Modal>
    </li>
  );
}
