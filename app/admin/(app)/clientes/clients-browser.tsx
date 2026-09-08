"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatCNPJ, formatDateBR } from "@/lib/types";

const PAGE = 20;

type ClientItem = {
  id: string;
  name: string;
  cnpj: string;
  created_at: string;
  equipCount: number;
  active: boolean;
};

export function ClientsBrowser({ clients }: { clients: ClientItem[] }) {
  const [q, setQ] = useState("");
  const [visible, setVisible] = useState(PAGE);
  const term = q.trim().toLowerCase();
  const digits = term.replace(/\D/g, "");
  const filtered = clients.filter((c) => {
    if (!term) return true;
    return c.name.toLowerCase().includes(term) || (digits && c.cnpj.includes(digits));
  });
  const shown = filtered.slice(0, visible);

  useEffect(() => {
    setVisible(PAGE);
  }, [term]);

  return (
    <div>
      {clients.length > 3 ? (
        <input
          className="field mb-4"
          placeholder="Buscar por nome ou CNPJ"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          autoCapitalize="none"
          autoCorrect="off"
        />
      ) : null}

      {filtered.length === 0 ? (
        <div className="card p-8 text-center text-[color:var(--color-muted)]">
          {clients.length === 0
            ? "Nenhum cliente cadastrado ainda. Comece cadastrando a primeira empresa."
            : "Nenhum cliente encontrado para essa busca."}
        </div>
      ) : (
        <div className="grid gap-3">
          {shown.map((c) => (
            <Link
              key={c.id}
              href={`/admin/clientes/${c.id}`}
              className="card p-4 flex items-center justify-between gap-3 hover:border-[color:var(--color-blue)] transition-colors"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-lg truncate">{c.name}</span>
                  {!c.active ? (
                    <span className="chip chip-corr shrink-0">inativo</span>
                  ) : null}
                </div>
                <div className="text-xs text-[color:var(--color-muted)] mt-0.5 font-mono">
                  {formatCNPJ(c.cnpj)}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm">
                  {c.equipCount} {c.equipCount === 1 ? "equipamento" : "equipamentos"}
                </div>
                <div className="text-xs text-[color:var(--color-faint)]">
                  desde {formatDateBR(c.created_at)}
                </div>
              </div>
            </Link>
          ))}
          {filtered.length > visible ? (
            <button
              className="btn btn-outline btn-sm mx-auto mt-1"
              onClick={() => setVisible((v) => v + PAGE)}
            >
              Carregar mais ({filtered.length - visible})
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
