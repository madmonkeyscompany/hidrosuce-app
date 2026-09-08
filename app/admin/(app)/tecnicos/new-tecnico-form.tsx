"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/app/_components/modal";
import { IconPlus } from "@/app/_components/icons";
import { createTecnicoAction, type ActionState } from "../../actions";

export function NewTecnicoForm() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    createTecnicoAction,
    null,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      setOpen(false);
      toast.success("Técnico cadastrado.");
    }
  }, [state]);

  return (
    <>
      <button className="btn btn-primary btn-sm" onClick={() => setOpen(true)}>
        <IconPlus width={16} height={16} /> Novo técnico
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="NOVO TÉCNICO">
        <form ref={formRef} action={formAction} className="grid gap-4">
          <div>
            <label className="label" htmlFor="name">Nome</label>
            <input id="name" name="name" className="field" placeholder="Ex.: André" required />
          </div>
          <div>
            <label className="label" htmlFor="username">Usuário</label>
            <input id="username" name="username" className="field" autoCapitalize="none" placeholder="andre" required />
          </div>
          <div>
            <label className="label" htmlFor="password">Senha</label>
            <input id="password" name="password" className="field" placeholder="senha do técnico" required />
          </div>

          {state?.error ? (
            <p className="text-sm text-[color:var(--color-magenta)]">{state.error}</p>
          ) : null}

          <div className="flex gap-2 pt-1">
            <button className="btn btn-primary" disabled={pending}>
              {pending ? "Salvando…" : "Cadastrar"}
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
