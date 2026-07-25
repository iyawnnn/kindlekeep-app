// src/components/ui/CopyField.tsx
import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from './button';

interface CopyFieldProps {
  label: string;
  value: string;
}

export const CopyField = ({ label, value }: CopyFieldProps) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs uppercase tracking-wider font-semibold text-zinc-500">{label}</span>
        <Button variant="ghost" size="sm" className="text-zinc-500 h-6 px-2" onClick={copy}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
      <p className="font-mono text-xs text-zinc-700 break-all">{value}</p>
    </div>
  );
};
