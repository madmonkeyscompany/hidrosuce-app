"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/app/_components/modal";
import { IconPlus } from "@/app/_components/icons";
import { createRecordAction, type ActionState } from "../../../actions";

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function NewRecordForm({
  equipmentId,
  currentName,
  staffNames,
  isSuper,
}: {
  equipmentId: string;
  currentName: string;
  staffNames: string[];
  isSuper: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    createRecordAction,
    null,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      setOpen(false);
      toast.success("Manutenção registrada.");
    }
  }, [state]);

  // Pré-selecionado no usuário logado; a lista traz todos os técnicos cadastrados.
  const options = Array.from(new Set([currentName, ...staffNames].filter(Boolean)));

  return (
    <>
      <button className="btn btn-primary btn-sm" onClick={() => setOpen(true)}>
        <IconPlus width={16} height={16} /> Manutenção
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="REGISTRAR MANUTENÇÃO">
        <form ref={formRef} action={formAction} className="grid gap-4">
          <input type="hidden" name="equipment_id" value={equipmentId} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="type">Tipo *</label>
              <select id="type" name="type" className="field" defaultValue="preventiva" required>
                <option value="preventiva">Preventiva</option>
                <option value="corretiva">Corretiva</option>
              </select>
            </div>
            <div>
              <label className="label" htmlFor="performed_at">Data *</label>
              <input id="performed_at" name="performed_at" type="date" className="field" defaultValue={today()} required />
            </div>
            {isSuper ? (
              <div>
                <label className="label" htmlFor="value">Valor (R$)</label>
                <input id="value" name="value" className="field" inputMode="decimal" placeholder="1.500,00" />
              </div>
            ) : null}
            <div>
              <label className="label" htmlFor="technician_name">Técnico</label>
              {isSuper ? (
                <select id="technician_name" name="technician_name" className="field" defaultValue={currentName}>
                  {options.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              ) : (
                <input className="field" value={currentName} disabled />
              )}
            </div>
          </div>
          <div>
            <label className="label" htmlFor="description">Descrição *</label>
            <textarea id="description" name="description" className="field" rows={4} placeholder="O que foi feito na manutenção" required />
          </div>
          <div>
            <label className="label" htmlFor="laudo">Laudo em PDF (opcional)</label>
            <input
              id="laudo"
              name="laudo"
              type="file"
              accept="application/pdf,.pdf"
              className="field text-sm file:mr-3 file:rounded-md file:border-0 file:cursor-pointer file:px-3 file:py-1.5 file:text-white file:bg-[var(--color-blue-dark)]"
              style={{ paddingTop: "0.45rem" }}
            />
            <p className="text-[11px] text-[color:var(--color-faint)] mt-1">
              Anexe o laudo da inspeção (ex.: gerado no Checkbits). Máx. 20 MB.
            </p>
          </div>

          {state?.error ? (
            <p className="text-sm text-[color:var(--color-magenta)]">{state.error}</p>
          ) : null}

          <div className="flex gap-2 pt-1">
            <button className="btn btn-primary" disabled={pending}>
              {pending ? "Salvando…" : "Salvar registro"}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)} disabled={pending}>
              Cancelar
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
