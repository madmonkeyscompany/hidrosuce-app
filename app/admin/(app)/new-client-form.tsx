"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/app/_components/modal";
import { IconPlus } from "@/app/_components/icons";
import { createClientAction, type ActionState } from "../actions";

export function NewClientForm() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    createClientAction,
    null,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      setOpen(false);
      toast.success("Cliente cadastrado.");
    }
  }, [state]);

  return (
    <>
      <button className="btn btn-primary btn-sm" onClick={() => setOpen(true)}>
        <IconPlus width={16} height={16} /> Novo cliente
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="NOVO CLIENTE">
        <form ref={formRef} action={formAction} className="grid gap-4">
          <div>
            <label className="label" htmlFor="name">Empresa</label>
            <input id="name" name="name" className="field" placeholder="Ex.: Impacto Logística" required />
          </div>
          <div>
            <label className="label" htmlFor="cnpj">CNPJ</label>
            <input id="cnpj" name="cnpj" className="field" inputMode="numeric" placeholder="00.000.000/0000-00" required />
          </div>
          <div>
            <label className="label" htmlFor="password">Senha de acesso do cliente</label>
            <input id="password" name="password" className="field" placeholder="senha que você entrega ao cliente" required />
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
