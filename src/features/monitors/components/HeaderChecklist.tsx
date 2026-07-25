// src/features/monitors/components/HeaderChecklist.tsx
import { ShieldCheck, ShieldAlert } from 'lucide-react';

export interface HeaderCheck {
  label: string;
  present: boolean;
}

export const HeaderChecklist = ({ items }: { items: HeaderCheck[] }) => (
  <div className="flex flex-col gap-2">
    {items.map((item) => (
      <div
        key={item.label}
        className="flex items-center justify-between p-3 rounded-lg border border-zinc-200 bg-zinc-50"
      >
        <span className="text-sm font-mono text-zinc-700">{item.label}</span>
        {item.present ? (
          <ShieldCheck className="text-primary" size={18} strokeWidth={1.5} />
        ) : (
          <ShieldAlert className="text-red-600" size={18} strokeWidth={1.5} />
        )}
      </div>
    ))}
  </div>
);
