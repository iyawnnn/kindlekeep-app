// src/features/monitors/components/EditMonitorModal.tsx
import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Dialog, Button, TextField, Text, Flex } from '@radix-ui/themes';
import { Loader2, Plus, X } from 'lucide-react';
import { api } from '../../../lib/axios';
import { useMonitorStore } from '../store/useMonitorStore';
import { useToastStore } from '../../../components/ui/useToastStore';
import type { MonitorDetailResponse, UpdateMonitorRequest } from '../types/monitor.types';

interface EditMonitorModalProps {
  monitorId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditMonitorModal = ({ monitorId, isOpen, onOpenChange }: EditMonitorModalProps) => {
  const queryClient = useQueryClient();
  const { updateMonitorInList } = useMonitorStore();

  const { data: monitor } = useQuery<MonitorDetailResponse>({
    queryKey: ['monitor', monitorId],
    queryFn: async () => {
      const response = await api.get(`/api/monitors/${monitorId}`);
      return response.data;
    },
    enabled: isOpen,
  });

  const [url, setUrl] = useState('');
  const [friendlyName, setFriendlyName] = useState('');
  const [intervalMinutes, setIntervalMinutes] = useState(10);
  const [requestTimeout, setRequestTimeout] = useState(30);
  const [headers, setHeaders] = useState<{ key: string; value: string }[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!monitor) return;
    setUrl(monitor.url);
    setFriendlyName(monitor.friendlyName);
    setIntervalMinutes(monitor.intervalMinutes);
    setRequestTimeout(monitor.requestTimeout);
    setHeaders(
      monitor.requestHeaders
        ? Object.entries(monitor.requestHeaders).map(([key, value]) => ({ key, value }))
        : []
    );
  }, [monitor]);

  const handleSubmit = async () => {
    setError(null);

    if (!friendlyName.trim()) {
      setError('Friendly Name is required.');
      return;
    }

    try {
      const parsedUrl = new URL(url);
      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        throw new Error('Invalid protocol');
      }
    } catch {
      setError('Please enter a valid HTTP or HTTPS URL.');
      return;
    }

    setIsSaving(true);

    const requestHeaders = headers.reduce<Record<string, string>>((acc, { key, value }) => {
      if (key.trim()) acc[key.trim()] = value;
      return acc;
    }, {});

    const body: UpdateMonitorRequest = {
      url,
      friendlyName,
      intervalMinutes,
      requestTimeout,
      requestHeaders: Object.keys(requestHeaders).length > 0 ? requestHeaders : null,
    };

    try {
      const response = await api.patch<MonitorDetailResponse>(`/api/monitors/${monitorId}`, body);
      updateMonitorInList(monitorId, {
        url: response.data.url,
        friendlyName: response.data.friendlyName,
      });
      queryClient.invalidateQueries({ queryKey: ['monitor', monitorId] });
      queryClient.invalidateQueries({ queryKey: ['monitorHistory', monitorId] });
      useToastStore.getState().success(`${friendlyName} updated.`);
      onOpenChange(false);
    } catch {
      setError('Failed to save changes. Verify the endpoint and try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const addHeaderRow = () => setHeaders([...headers, { key: '', value: '' }]);
  const removeHeaderRow = (index: number) => setHeaders(headers.filter((_, i) => i !== index));
  const updateHeaderRow = (index: number, field: 'key' | 'value', value: string) => {
    setHeaders(headers.map((h, i) => (i === index ? { ...h, [field]: value } : h)));
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Content
        className="bg-white border border-zinc-200 !rounded-none"
        style={{ maxWidth: 480 }}
      >
        <Dialog.Title className="font-heading font-black text-xl text-zinc-900 mb-2">
          Edit Target
        </Dialog.Title>
        <Dialog.Description className="font-sans text-zinc-500 text-sm mb-6">
          Update endpoint configuration, polling cadence, and authenticated-request headers.
        </Dialog.Description>

        <Flex direction="column" gap="4">
          <label>
            <Text as="div" size="2" mb="2" className="font-sans text-zinc-700 font-bold text-xs uppercase tracking-widest">
              Target URL
            </Text>
            <TextField.Root
              size="3"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="font-mono text-sm"
              variant="surface"
              color="gray"
            />
          </label>

          <label>
            <Text as="div" size="2" mb="2" className="font-sans text-zinc-700 font-bold text-xs uppercase tracking-widest">
              Friendly Name
            </Text>
            <TextField.Root
              size="3"
              value={friendlyName}
              onChange={(e) => setFriendlyName(e.target.value)}
              className="font-sans text-sm"
              variant="surface"
              color="gray"
            />
          </label>

          <Flex gap="4">
            <label className="flex-1">
              <Text as="div" size="2" mb="2" className="font-sans text-zinc-700 font-bold text-xs uppercase tracking-widest">
                Interval (min)
              </Text>
              <TextField.Root
                size="3"
                type="number"
                min={1}
                value={intervalMinutes}
                onChange={(e) => setIntervalMinutes(Number(e.target.value))}
                className="font-mono text-sm"
                variant="surface"
                color="gray"
              />
            </label>
            <label className="flex-1">
              <Text as="div" size="2" mb="2" className="font-sans text-zinc-700 font-bold text-xs uppercase tracking-widest">
                Timeout (sec)
              </Text>
              <TextField.Root
                size="3"
                type="number"
                min={1}
                max={60}
                value={requestTimeout}
                onChange={(e) => setRequestTimeout(Number(e.target.value))}
                className="font-mono text-sm"
                variant="surface"
                color="gray"
              />
            </label>
          </Flex>

          <div>
            <Flex align="center" justify="between" mb="2">
              <Text as="div" size="2" className="font-sans text-zinc-700 font-bold text-xs uppercase tracking-widest">
                Custom Headers
              </Text>
              <Button size="1" variant="ghost" onClick={addHeaderRow} className="cursor-pointer">
                <Plus size={14} /> Add
              </Button>
            </Flex>
            <Flex direction="column" gap="2">
              {headers.map((h, i) => (
                <Flex key={i} gap="2" align="center">
                  <TextField.Root
                    size="2"
                    placeholder="Authorization"
                    value={h.key}
                    onChange={(e) => updateHeaderRow(i, 'key', e.target.value)}
                    className="font-mono text-xs flex-1"
                    variant="surface"
                    color="gray"
                  />
                  <TextField.Root
                    size="2"
                    placeholder="Bearer ..."
                    value={h.value}
                    onChange={(e) => updateHeaderRow(i, 'value', e.target.value)}
                    className="font-mono text-xs flex-1"
                    variant="surface"
                    color="gray"
                  />
                  <button onClick={() => removeHeaderRow(i)} className="text-zinc-400 hover:text-red-600 transition-colors cursor-pointer">
                    <X size={16} />
                  </button>
                </Flex>
              ))}
            </Flex>
          </div>

          {error && (
            <Text color="red" size="2" className="font-sans text-sm mt-2">
              {error}
            </Text>
          )}
        </Flex>

        <Flex gap="3" mt="6" justify="end">
          <Dialog.Close>
            <Button variant="outline" color="gray" className="cursor-pointer font-mono">
              Cancel
            </Button>
          </Dialog.Close>
          <Button
            onClick={handleSubmit}
            disabled={isSaving}
            color="blue"
            className="cursor-pointer font-mono"
          >
            {isSaving ? <Loader2 strokeWidth={1} className="w-4 h-4 animate-spin mr-2" /> : null}
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};
