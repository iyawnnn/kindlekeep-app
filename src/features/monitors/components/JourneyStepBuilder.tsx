// src/features/monitors/components/JourneyStepBuilder.tsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowUp, ArrowDown, Plus, X, AlertTriangle } from 'lucide-react';
import type { JourneyStep } from '../types/monitor.types';

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

interface JourneyStepBuilderProps {
  steps: JourneyStep[];
  onChange: (steps: JourneyStep[]) => void;
}

export const JourneyStepBuilder = ({ steps, onChange }: JourneyStepBuilderProps) => {
  const updateStep = (index: number, patch: Partial<JourneyStep>) => {
    onChange(steps.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  };

  const addStep = () => onChange([...steps, {
    stepOrder: 0,
    method: 'GET',
    url: '',
    headers: null,
    body: null,
    captureAs: null,
    captureJsonPath: null,
    assertJsonPath: null,
    assertEquals: null,
    expectedStatusCode: null,
  }]);
  const removeStep = (index: number) => onChange(steps.filter((_, i) => i !== index));

  const moveStep = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= steps.length) return;
    const reordered = [...steps];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    onChange(reordered);
  };

  const updateHeaderRow = (index: number, key: string, value: string, oldKey?: string) => {
    const headers = { ...(steps[index].headers ?? {}) };
    if (oldKey && oldKey !== key) delete headers[oldKey];
    headers[key] = value;
    updateStep(index, { headers });
  };

  const removeHeaderRow = (index: number, key: string) => {
    const headers = { ...(steps[index].headers ?? {}) };
    delete headers[key];
    updateStep(index, { headers: Object.keys(headers).length > 0 ? headers : null });
  };

  return (
    <div className="flex flex-col gap-4">
      {steps.map((step, index) => (
        <div key={index} className="rounded-lg border border-zinc-200 p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-zinc-700">Step {index + 1}</p>
            <div className="flex items-center gap-1">
              <button onClick={() => moveStep(index, -1)} disabled={index === 0} className="text-zinc-400 hover:text-zinc-700 disabled:opacity-30 transition-colors cursor-pointer">
                <ArrowUp size={14} strokeWidth={1.5} />
              </button>
              <button onClick={() => moveStep(index, 1)} disabled={index === steps.length - 1} className="text-zinc-400 hover:text-zinc-700 disabled:opacity-30 transition-colors cursor-pointer">
                <ArrowDown size={14} strokeWidth={1.5} />
              </button>
              <button onClick={() => removeStep(index)} className="text-zinc-400 hover:text-red-600 transition-colors cursor-pointer">
                <X size={14} strokeWidth={1.5} />
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <select
              value={step.method}
              onChange={(e) => updateStep(index, { method: e.target.value })}
              className="flex h-9 rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              {METHODS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <Input
              placeholder="https://api.example.com/orders"
              value={step.url}
              onChange={(e) => updateStep(index, { url: e.target.value })}
              className="font-mono text-sm flex-1"
            />
          </div>

          {step.method !== 'GET' && (
            <p className="flex items-center gap-1.5 text-xs text-amber-700">
              <AlertTriangle size={12} strokeWidth={1.5} />
              This step re-runs on every check and every retry (up to 3x per probe) — avoid endpoints with irreversible side effects.
            </p>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <Label className="text-xs">Headers</Label>
              <Button size="sm" variant="ghost" className="h-6 px-2" onClick={() => updateHeaderRow(index, '', '')}>
                <Plus size={12} /> Add
              </Button>
            </div>
            <div className="flex flex-col gap-1.5">
              {Object.entries(step.headers ?? {}).map(([key, value]) => (
                <div key={key} className="flex gap-2 items-center">
                  <Input
                    placeholder="Authorization"
                    value={key}
                    onChange={(e) => updateHeaderRow(index, e.target.value, value, key)}
                    className="font-mono text-xs flex-1"
                  />
                  <Input
                    placeholder="Bearer {{token}}"
                    value={value}
                    onChange={(e) => updateHeaderRow(index, key, e.target.value, key)}
                    className="font-mono text-xs flex-1"
                  />
                  <button onClick={() => removeHeaderRow(index, key)} className="text-zinc-400 hover:text-red-600 transition-colors cursor-pointer">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs">Body (JSON)</Label>
            <textarea
              value={step.body ?? ''}
              onChange={(e) => updateStep(index, { body: e.target.value || null })}
              placeholder='{"key": "value"}'
              rows={2}
              className="mt-1 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1.5 text-xs font-mono shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Capture as</Label>
              <Input
                placeholder="token"
                value={step.captureAs ?? ''}
                onChange={(e) => updateStep(index, { captureAs: e.target.value || null })}
                className="font-mono text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Capture JSON path</Label>
              <Input
                placeholder="$.data.token"
                value={step.captureJsonPath ?? ''}
                onChange={(e) => updateStep(index, { captureJsonPath: e.target.value || null })}
                className="font-mono text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Assert JSON path</Label>
              <Input
                placeholder="$.status"
                value={step.assertJsonPath ?? ''}
                onChange={(e) => updateStep(index, { assertJsonPath: e.target.value || null })}
                className="font-mono text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Equals</Label>
              <Input
                placeholder="active"
                value={step.assertEquals ?? ''}
                onChange={(e) => updateStep(index, { assertEquals: e.target.value || null })}
                className="font-mono text-xs mt-1"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs">Expected status code (optional, default 2xx)</Label>
            <Input
              type="number"
              placeholder="200"
              value={step.expectedStatusCode ?? ''}
              onChange={(e) => updateStep(index, { expectedStatusCode: e.target.value ? Number(e.target.value) : null })}
              className="font-mono text-xs mt-1 max-w-32"
            />
          </div>
        </div>
      ))}

      <Button variant="outline" onClick={addStep} disabled={steps.length >= 10} className="gap-2">
        <Plus size={16} strokeWidth={1.5} />
        Add Step
      </Button>
    </div>
  );
};
