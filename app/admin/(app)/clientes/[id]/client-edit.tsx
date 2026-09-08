"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/app/_components/modal";
import { IconEdit } from "@/app/_components/icons";
import {
  updateClientAction,
  deleteClientAction,
  setClientActiveAction,
  type ActionState,
} from "../../../actions";
import { formatCNPJ } from "@/lib/types";

export function ClientEdit({
  client,
}: {
  client: { id: string; name: string; cnpj: string; active: boolean };
}) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [upState, upAction, upPending] = useActionState<ActionState, FormData>(
    updateClientAction,
    null,
  );
  const [delState, delAction, delPending] = useActionState<ActionState, FormData>(
    deleteClientAction,
    null,
  );
  const [tgState, tgAction, tgPending] = useActionState<ActionState, FormData>(
    setClientActiveAction,
    null,
  );

  useEffect(() => {
    if (upState?.ok) {
      setOpen(false);
      toast.success("Cliente atualizado.");
    }
  }, [upState]);

  useEffect(() => {
    if (tgState?.ok) toast.success("Acesso do cliente atualizado.");
  }, [tgState]);

  return (
    <>
      <button className="icon-btn" onClick={() => setOpen(true)} aria-label="Editar cliente">
        <IconEdit />
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="EDITAR CLIENTE">
        <form action={upAction} className="grid gap-4">
          <input type="hidden" name="id" value={client.id} />
          <div>
            <label className="label" htmlFor="c-name">Empresa</label>
            <input id="c-name" name="name" className="field" defaultValue={client.name} required />
          </div>
          <div>
            <label className="label" htmlFor="c-cnpj">CNPJ</label>
            <input id="c-cnpj" name="cnpj" className="field" inputMode="numeric" defaultValue={formatCNPJ(client.cnpj)} required />
          </div>
          <div>
            <label className="label" htmlFor="c-pass">Nova senha de acesso</label>
            <input id="c-pass" name="password" className="field" placeholder="deixe em branco p/ manter" />
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

        <div className="border-t border-[color:var(--color-line)] mt-5 pt-4 flex items-center justify-between gap-3">
          <div className="text-sm">
            <span className="text-[color:var(--color-muted)]">Acesso do cliente: </span>
            <b className={client.active ? "text-[color:var(--color-ok)]" : "text-[color:var(--color-warn)]"}>
              {client.active ? "ativo" : "inativo"}
            </b>
          </div>
          <form action={tgAction}>
            <input type="hidden" name="id" value={client.id} />
            <input type="hidden" name="active" value={client.active ? "0" : "1"} />
            <button className="btn btn-outline btn-sm" disabled={tgPending}>
              {tgPending ? "…" : client.active ? "Desativar" : "Ativar"}
            </button>
          </form>
        </div>
        {tgState?.error ? (
          <p className="text-sm text-[color:var(--color-magenta)] mt-2">{tgState.error}</p>
        ) : null}

        <div className="border-t border-[color:var(--color-line)] mt-4 pt-4">
          {delState?.error ? (
            <p className="text-sm text-[color:var(--color-magenta)] mb-2">{delState.error}</p>
          ) : null}
          {confirming ? (
            <form action={delAction} className="grid gap-2">
              <input type="hidden" name="id" value={client.id} />
              <span className="text-sm text-[color:var(--color-muted)]">
                Remover o cliente e <b>todos</b> os equipamentos e registros dele? Não dá pra desfazer.
              </span>
              <div className="flex gap-2">
                <button className="btn btn-sm" style={{ background: "var(--color-magenta)", color: "white" }} disabled={delPending}>
                  {delPending ? "…" : "Sim, remover tudo"}
                </button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirming(false)}>
                  Não
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              className="text-sm text-[color:var(--color-magenta)] hover:underline"
              onClick={() => setConfirming(true)}
            >
              Remover cliente
            </button>
          )}
        </div>
      </Modal>
    </>
  );
}
