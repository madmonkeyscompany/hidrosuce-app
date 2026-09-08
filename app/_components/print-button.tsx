"use client";

export function PrintButton({ label = "Baixar PDF" }: { label?: string }) {
  return (
    <button className="btn btn-outline btn-sm no-print" onClick={() => window.print()}>
      {label}
    </button>
  );
}
