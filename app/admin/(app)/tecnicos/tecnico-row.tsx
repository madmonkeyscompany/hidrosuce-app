"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/app/_components/modal";
import { IconEdit } from "@/app/_components/icons";
import {
  updateStaffAction,
  deleteStaffAction,
  setStaffActiveAction,
  type ActionState,
} from "../../actions";
import { formatDateBR } from "@/lib/types";

type Staff = {
  id: string;
  username: string;
  name: string;
  role: "super_admin" | "tecnico";
  is_active: boolean;
  created_at: string;
};

export function TecnicoRow({ staff }: { staff: Staff }) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [upState, upAction, upPending] = useActionState<ActionState, FormData>(
    updateStaffAction,
    null,
  );
  const [delState, delAction, delPending] = useActionState<ActionState, FormData>(
    deleteStaffAction,
    null,
  );
  const [tgState, tgAction, tgPending] = useActionState<ActionState, FormData>(
    setStaffActiveAction,
    null,
  );

  useEffect(() => {
    if (upState?.ok) {
      setOpen(false);
      toast.success("Técnico atualizado.");
    }
  }, [upState]);

  useEffect(() => {
    if (tgState?.ok) toast.success("Acesso do técnico atualizado.");
  }, [tgState]);

  const isSuper = staff.role === "super_admin";

  return (
    <div className="card p-4 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="font-medium">
          {staff.name}
          {!staff.is_active ? (
            <span className="text-[color:var(--color-warn)] text-xs ml-2">· inativo</span>
          ) : null}
        </div>
        <div className="text-xs text-[color:var(--color-muted)] font-mono mt-0.5">@{staff.username}</div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right">
          <span className={`chip ${isSuper ? "chip-corr" : "chip-prev"}`}>
            {isSuper ? "Super admin" : "Técnico"}
          </span>
          <div className="text-[11px] text-[color:var(--color-faint)] mt-1">
            desde {formatDateBR(staff.created_at)}
          </div>
        </div>
        {!isSuper ? (
          <button className="icon-btn" onClick={() => setOpen(true)} aria-label="Editar">
            <IconEdit />
          </button>
        ) : null}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="EDITAR TÉCNICO">
        <form action={upAction} className="grid gap-4">
          <input type="hidden" name="id" value={staff.id} />
          <div>
            <label className="label" htmlFor={`n-${staff.id}`}>Nome</label>
            <input id={`n-${staff.id}`} name="name" className="field" defaultValue={staff.name} required />
          </div>
          <div>
            <label className="label" htmlFor={`u-${staff.id}`}>Usuário</label>
            <input id={`u-${staff.id}`} name="username" className="field" autoCapitalize="none" defaultValue={staff.username} required />
          </div>
          <div>
            <label className="label" htmlFor={`p-${staff.id}`}>Nova senha</label>
            <input id={`p-${staff.id}`} name="password" className="field" placeholder="deixe em branco p/ manter" />
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
            <span className="text-[color:var(--color-muted)]">Acesso: </span>
            <b className={staff.is_active ? "text-[color:var(--color-ok)]" : "text-[color:var(--color-warn)]"}>
              {staff.is_active ? "ativo" : "inativo"}
            </b>
          </div>
          <form action={tgAction}>
            <input type="hidden" name="id" value={staff.id} />
            <input type="hidden" name="active" value={staff.is_active ? "0" : "1"} />
            <button className="btn btn-outline btn-sm" disabled={tgPending}>
              {tgPending ? "…" : staff.is_active ? "Desativar" : "Ativar"}
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
            <form action={delAction} className="flex items-center gap-2">
              <input type="hidden" name="id" value={staff.id} />
              <span className="text-sm text-[color:var(--color-muted)]">Remover este técnico?</span>
              <button
                className="btn btn-sm"
                style={{ background: "var(--color-magenta)", color: "white" }}
                disabled={delPending}
              >
                {delPending ? "…" : "Sim, remover"}
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
              Remover técnico
            </button>
          )}
        </div>
      </Modal>
    </div>
  );
}
