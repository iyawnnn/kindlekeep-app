import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Plus } from 'lucide-react';
import { api } from '../../../lib/axios';
import { useToastStore } from '../../../components/ui/useToastStore';
import type { MonitorResponse } from '../../monitors/store/useMonitorStore';
import type { StatusPageServiceResponse } from '../types/statusHub.types';

interface AttachServiceModalProps {
  statusPageId: string;
  attachedMonitorIds: Set<string>;
  onAttached: (service: StatusPageServiceResponse) => void;
}

export const AttachServiceModal = ({ statusPageId, attachedMonitorIds, onAttached }: AttachServiceModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [monitorId, setMonitorId] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [sectionName, setSectionName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: monitors } = useQuery<MonitorResponse[]>({
    queryKey: ['monitors'],
    queryFn: async () => {
      const response = await api.get('/api/monitors');
      return response.data;
    },
    enabled: isOpen,
  });

  const availableMonitors = (monitors ?? []).filter((m) => !attachedMonitorIds.has(m.id));

  const handleMonitorChange = (id: string) => {
    setMonitorId(id);
    const monitor = availableMonitors.find((m) => m.id === id);
    if (monitor) setDisplayName(monitor.friendlyName);
  };

  const reset = () => {
    setMonitorId('');
    setDisplayName('');
    setSectionName('');
    setError(null);
  };

  const handleSubmit = async () => {
    setError(null);

    if (!monitorId) {
      setError('Select a monitor to attach.');
      return;
    }

    if (!displayName.trim()) {
      setError('Display name is required.');
      return;
    }

    setIsSaving(true);

    try {
      const response = await api.post<StatusPageServiceResponse>(`/api/status-pages/${statusPageId}/services`, {
        monitorId,
        displayName,
        sectionName: sectionName.trim() || null,
      });
      onAttached(response.data);
      useToastStore.getState().success(`${displayName} attached.`);
      setIsOpen(false);
      reset();
    } catch (err) {
      const status = (err as { response?: { status?: number } }).response?.status;
      setError(status === 409 ? 'That monitor is already on this page.' : 'Failed to attach monitor.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) reset(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Plus size={16} strokeWidth={1.5} />
          Attach Monitor
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Attach a monitor</DialogTitle>
          <DialogDescription>Add it as a service on this status page.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {availableMonitors.length === 0 ? (
            <p className="text-sm text-zinc-500">All of your monitors are already attached to this page.</p>
          ) : (
            <>
              <div className="flex flex-col gap-2">
                <Label htmlFor="attach-monitor-select">Monitor</Label>
                <select
                  id="attach-monitor-select"
                  value={monitorId}
                  onChange={(e) => handleMonitorChange(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  <option value="" disabled>Select a monitor</option>
                  {availableMonitors.map((m) => (
                    <option key={m.id} value={m.id}>{m.friendlyName}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="attach-display-name">Display name</Label>
                <Input id="attach-display-name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="attach-section">Section (optional)</Label>
                <Input
                  id="attach-section"
                  value={sectionName}
                  onChange={(e) => setSectionName(e.target.value)}
                  placeholder="e.g. Core Services"
                />
              </div>
            </>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving || availableMonitors.length === 0}>
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {isSaving ? 'Attaching...' : 'Attach'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
