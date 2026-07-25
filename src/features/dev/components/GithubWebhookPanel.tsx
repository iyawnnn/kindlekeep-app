// src/features/dev/components/GithubWebhookPanel.tsx
import { useState } from 'react';
import { Box, Button, Flex, Select, Text, Code } from '@radix-ui/themes';
import { Copy, Check, Webhook } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/axios';
import type { MonitorResponse } from '../../monitors/store/useMonitorStore';

interface WebhookSecretResponse {
  secret: string;
}

const CopyField = ({ label, value }: { label: string; value: string }) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Box>
      <Text size="1" className="uppercase tracking-wider font-bold text-zinc-500 font-onest block mb-1">{label}</Text>
      <Flex align="center" justify="between" gap="3" className="bg-zinc-50 border border-zinc-200 p-3">
        <Code variant="ghost" className="text-zinc-700 font-mono text-sm break-all">{value}</Code>
        <Button variant="ghost" className="cursor-pointer text-zinc-500 shrink-0" onClick={copy}>
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </Button>
      </Flex>
    </Box>
  );
};

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
    <Box className="bg-white border border-zinc-200 shadow-sm p-6" style={{ borderRadius: 0 }}>
      <Flex align="center" gap="3" className="mb-6">
        <Webhook className="w-5 h-5 text-blue-500" strokeWidth={1} />
        <Text className="font-unbounded font-bold text-xl text-zinc-900">GitHub Webhook</Text>
      </Flex>

      <Text size="2" className="text-zinc-500 font-onest block mb-4">
        Trigger an immediate audit whenever you push or deploy, instead of waiting for the next scheduled check.
      </Text>

      <Flex direction="column" gap="4">
        <Box>
          <Text size="1" className="uppercase tracking-wider font-bold text-zinc-500 font-onest block mb-1">Monitor</Text>
          <Select.Root value={monitorId ?? undefined} onValueChange={setMonitorId}>
            <Select.Trigger placeholder="Select a monitor..." style={{ borderRadius: 0 }} className="w-full font-onest" />
            <Select.Content style={{ borderRadius: 0 }}>
              {monitors?.map((m) => (
                <Select.Item key={m.id} value={m.id}>{m.friendlyName}</Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </Box>

        {webhookUrl && <CopyField label="Webhook URL" value={webhookUrl} />}
        {webhookSecret && <CopyField label="Webhook Secret" value={webhookSecret.secret} />}

        {monitorId && (
          <Text size="1" className="text-zinc-500 font-onest">
            In your GitHub repo: Settings → Webhooks → Add webhook. Paste the URL as the Payload URL, the secret
            as the Secret, content type <strong>application/json</strong>, and trigger on <strong>push</strong> events.
          </Text>
        )}
      </Flex>
    </Box>
  );
};
