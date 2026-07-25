// src/features/dev/components/GithubWebhookPanel.tsx
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CopyField } from '@/components/ui/CopyField';
import { Webhook } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/axios';
import type { MonitorResponse } from '../../monitors/store/useMonitorStore';

interface WebhookSecretResponse {
  secret: string;
}

export const GithubWebhookPanel = () => {
  const [monitorId, setMonitorId] = useState<string | null>(null);

  const { data: monitors } = useQuery<MonitorResponse[]>({
    queryKey: ['monitors'],
    queryFn: async () => {
      const response = await api.get('/api/monitors');
      return response.data;
    },
  });

  const { data: webhookSecret } = useQuery<WebhookSecretResponse>({
    queryKey: ['webhookSecret'],
    queryFn: async () => {
      const response = await api.get('/api/dev/webhook-secret');
      return response.data;
    },
  });

  const webhookUrl = monitorId ? `${api.defaults.baseURL}/api/webhooks/github/${monitorId}` : null;

  return (
    <div className="rounded-xl bg-white border border-zinc-200 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <Webhook className="w-5 h-5 text-primary" strokeWidth={1.5} />
        <p className="text-xl font-semibold text-zinc-900">GitHub Webhook</p>
      </div>

      <p className="text-sm text-zinc-500 mb-4">
        Trigger an immediate audit whenever you push or deploy, instead of waiting for the next scheduled check.
      </p>

      <div className="flex flex-col gap-4">
        <div>
          <label className="text-xs uppercase tracking-wider font-semibold text-zinc-500 block mb-1">Monitor</label>
          <Select value={monitorId ?? undefined} onValueChange={setMonitorId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a monitor..." />
            </SelectTrigger>
            <SelectContent>
              {monitors?.map((m) => (
                <SelectItem key={m.id} value={m.id}>{m.friendlyName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {webhookUrl && <CopyField label="Webhook URL" value={webhookUrl} />}
        {webhookSecret && <CopyField label="Webhook Secret" value={webhookSecret.secret} />}

        {monitorId && (
          <p className="text-xs text-zinc-500">
            In your GitHub repo: Settings → Webhooks → Add webhook. Paste the URL as the Payload URL, the secret
            as the Secret, content type <strong>application/json</strong>, and trigger on <strong>push</strong> events.
          </p>
        )}
      </div>
    </div>
  );
};
