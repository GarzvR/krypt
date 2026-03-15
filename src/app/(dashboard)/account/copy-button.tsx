"use client";

import { useState } from "react";
import { Copy, Check } from "@phosphor-icons/react";

export function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 text-app-muted hover:text-white transition-colors border border-white/10 bg-white/5 hover:bg-white/10"
      title="Copy Token"
    >
      {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
    </button>
  );
}
