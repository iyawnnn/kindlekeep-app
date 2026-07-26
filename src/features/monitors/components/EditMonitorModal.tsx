// src/features/monitors/components/EditMonitorModal.tsx
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, X } from 'lucide-react';
import { api } from '../../../lib/axios';
import { useMonitorStore } from '../store/useMonitorStore';
import { useToastStore } from '../../../components/ui/useToastStore';
import { MonitorType, type JourneyStep, type MonitorDetailResponse, type UpdateMonitorRequest } from '../types/monitor.types';
import { JourneyStepBuilder } from './JourneyStepBuilder';

interface EditMonitorModalProps {
  monitorId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditMonitorModal = ({ monitorId, isOpen, onOpenChange }: EditMonitorModalProps) => {
  const { data: monitor, isLoading, isError, refetch } = useQuery<MonitorDetailResponse>({
    queryKey: ['monitor', monitorId],
    queryFn: async () => {
      const response = await api.get(`/api/monitors/${monitorId}`);
      return response.data;
    },
    enabled: isOpen,
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Edit monitor</DialogTitle>
          <DialogDescription>
            Update endpoint configuration, polling cadence, and authenticated-request headers.
          </DialogDescription>
        </DialogHeader>

        {isError ? (
          <div className="flex flex-col items-center justify-center gap-3 h-48 text-center">
            <p className="text-sm text-red-600">Failed to load this monitor.</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : isLoading || !monitor ? (
          <div className="flex items-center justify-center h-48 text-zinc-500">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : (
          // Keyed by monitor id so switching targets while the dialog is open always remounts with
          // fresh initial state, rather than syncing server data into local state via an effect.
          <EditMonitorForm key={monitor.id} monitor={monitor} monitorId={monitorId} onOpenChange={onOpenChange} />
        )}
      </DialogContent>
    </Dialog>
  );
};

interface EditMonitorFormProps {
  monitor: MonitorDetailResponse;
  monitorId: string;
  onOpenChange: (open: boolean) => void;
}

const EditMonitorForm = ({ monitor, monitorId, onOpenChange }: EditMonitorFormProps) => {
  const queryClient = useQueryClient();
  const { updateMonitorInList } = useMonitorStore();

  const isJourney = monitor.monitorType === MonitorType.Journey;

  const [url, setUrl] = useState(monitor.url);
  const [friendlyName, setFriendlyName] = useState(monitor.friendlyName);
  const [intervalMinutes, setIntervalMinutes] = useState(monitor.intervalMinutes);
  const [requestTimeout, setRequestTimeout] = useState(monitor.requestTimeout);
  const [headers, setHeaders] = useState<{ key: string; value: string }[]>(
    monitor.requestHeaders
      ? Object.entries(monitor.requestHeaders).map(([key, value]) => ({ key, value }))
      : []
  );
  const [steps, setSteps] = useState<JourneyStep[]>(monitor.steps ?? []);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);

    if (!friendlyName.trim()) {
      setError('Friendly Name is required.');
      return;
    }

    if (isJourney) {
      if (steps.length === 0 || !steps[0].url.trim()) {
        setError('At least one step with a URL is required.');
        return;
      }
    } else {
      try {
        const parsedUrl = new URL(url);
        if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
          throw new Error('Invalid protocol');
        }
      } catch {
        setError('Please enter a valid HTTP or HTTPS URL.');
        return;
      }
    }

    setIsSaving(true);

    const requestHeaders = headers.reduce<Record<string, string>>((acc, { key, value }) => {
      if (key.trim()) acc[key.trim()] = value;
      return acc;
    }, {});

    const body: UpdateMonitorRequest = {
      url: isJourney ? null : url,
      friendlyName,
      intervalMinutes,
      requestTimeout,
      requestHeaders: Object.keys(requestHeaders).length > 0 ? requestHeaders : null,
      monitorType: monitor.monitorType,
      steps: isJourney ? steps : null,
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
    <>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="edit-monitor-name">Friendly Name</Label>
          <Input
            id="edit-monitor-name"
            value={friendlyName}
            onChange={(e) => setFriendlyName(e.target.value)}
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1 flex flex-col gap-2">
            <Label htmlFor="edit-monitor-interval">Interval (min)</Label>
            <Input
              id="edit-monitor-interval"
              type="number"
              min={1}
              value={intervalMinutes}
              onChange={(e) => setIntervalMinutes(Number(e.target.value))}
              className="font-mono text-sm"
            />
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <Label htmlFor="edit-monitor-timeout">Timeout (sec)</Label>
            <Input
              id="edit-monitor-timeout"
              type="number"
              min={1}
              max={60}
              value={requestTimeout}
              onChange={(e) => setRequestTimeout(Number(e.target.value))}
              className="font-mono text-sm"
            />
          </div>
        </div>

        {isJourney ? (
          <JourneyStepBuilder steps={steps} onChange={setSteps} />
        ) : (
          <>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-monitor-url">Target URL</Label>
              <Input
                id="edit-monitor-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="font-mono text-sm"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Custom Headers</Label>
                <Button size="sm" variant="ghost" onClick={addHeaderRow} className="cursor-pointer">
                  <Plus size={14} /> Add
                </Button>
              </div>
              <div className="flex flex-col gap-2">
                {headers.map((h, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Input
                      placeholder="Authorization"
                      value={h.key}
                      onChange={(e) => updateHeaderRow(i, 'key', e.target.value)}
                      className="font-mono text-xs flex-1"
                    />
                    <Input
                      placeholder="Bearer ..."
                      value={h.value}
                      onChange={(e) => updateHeaderRow(i, 'value', e.target.value)}
                      className="font-mono text-xs flex-1"
                    />
                    <button onClick={() => removeHeaderRow(i)} className="text-zinc-400 hover:text-red-600 transition-colors cursor-pointer">
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isSaving}>
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogFooter>
    </>
  );
};
