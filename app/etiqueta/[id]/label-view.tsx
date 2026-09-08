"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function LabelView({
  equipmentId,
  serial,
  label,
  clientName,
}: {
  equipmentId: string;
  serial: string;
  label: string | null;
  clientName: string;
}) {
  const [svg, setSvg] = useState("");
  const [url, setUrl] = useState("");

  useEffect(() => {
    const target = `${window.location.origin}/e/${equipmentId}`;
    setUrl(target);
    let cancelled = false;
    void (async () => {
      try {
        const QRCode = (await import("qrcode")).default;
        const out = await QRCode.toString(target, {
          type: "svg",
          margin: 1,
          errorCorrectionLevel: "M",
        });
        if (!cancelled) setSvg(out);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [equipmentId]);

  return (
    <div className="min-h-dvh flex flex-col items-center px-5 py-8">
      <style>{`@media print { .no-print { display:none !important } .label-card { border:1px solid #000 !important } html,body { background:#fff !important } }`}</style>

      <div className="no-print mb-6 flex w-full max-w-sm items-center justify-between">
        <Link href="/admin" className="text-sm text-[color:var(--color-muted)] hover:text-white">
          ← Painel
        </Link>
        <button className="btn btn-primary" onClick={() => window.print()}>
          Imprimir etiqueta
        </button>
      </div>

      <div className="label-card w-full max-w-sm rounded-2xl border border-[color:var(--color-line)] bg-white p-6 text-center text-black">
        <div className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
          Hidro Suce · Manutenção
        </div>
        <div className="mx-auto mt-4 h-56 w-56">
          {svg ? (
            <div
              className="h-full w-full [&_svg]:h-full [&_svg]:w-full"
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-neutral-400">
              Gerando QR…
            </div>
          )}
        </div>
        <div className="mt-4 text-lg font-bold text-neutral-800">{clientName}</div>
        {label ? <div className="text-sm text-neutral-600">{label}</div> : null}
        <div className="mt-1 font-mono text-sm font-semibold tracking-wider text-neutral-700">
          {serial}
        </div>
        <div className="mt-3 text-[11px] leading-snug text-neutral-500">
          Escaneie o QR code para ver o histórico de manutenções deste equipamento.
        </div>
      </div>

      {url ? (
        <div className="no-print mt-4 max-w-sm text-center text-xs text-[color:var(--color-faint)]">
          Link do QR: <span className="break-all font-mono">{url}</span>
        </div>
      ) : null}
    </div>
  );
}
