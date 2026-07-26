// src/features/monitors/components/AddMonitorModal.tsx
import { useState } from 'react';
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
import { Plus, Loader2 } from 'lucide-react';
import { api } from '../../../lib/axios';
import { useMonitorStore } from '../store/useMonitorStore';
import { MonitorType, type JourneyStep, type CreateMonitorRequest } from '../types/monitor.types';
import { JourneyStepBuilder } from './JourneyStepBuilder';

const emptyStep = (): JourneyStep => ({
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
});

export const AddMonitorModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [monitorType, setMonitorType] = useState<MonitorType>(MonitorType.Http);
  const [url, setUrl] = useState('');
  const [friendlyName, setFriendlyName] = useState('');
  const [steps, setSteps] = useState<JourneyStep[]>([emptyStep()]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { monitors, setMonitors } = useMonitorStore();

  const reset = () => {
    setMonitorType(MonitorType.Http);
    setUrl('');
    setFriendlyName('');
    setSteps([emptyStep()]);
    setError(null);
  };

  const handleSubmit = async () => {
    setError(null);

    if (!friendlyName.trim()) {
      setError('Friendly Name is required.');
      return;
    }

    if (monitorType === MonitorType.Http) {
      try {
        const parsedUrl = new URL(url);
        if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
          throw new Error('Invalid protocol');
        }
      } catch {
        setError('Please enter a valid HTTP or HTTPS URL.');
        return;
      }
    } else if (steps.length === 0 || !steps[0].url.trim()) {
      setError('At least one step with a URL is required.');
      return;
    }

    setIsLoading(true);

    const body: CreateMonitorRequest = {
      url: monitorType === MonitorType.Http ? url : null,
      friendlyName,
      monitorType,
      steps: monitorType === MonitorType.Journey ? steps : null,
    };

    try {
      const response = await api.post('/api/monitors', body);
      setMonitors([...monitors, response.data]);
      setIsOpen(false);
      reset();
    } catch (err) {
      console.error('Failed to create monitor payload:', err);
      const detail = (err as { response?: { data?: { detail?: string } } }).response?.data?.detail;
      setError(detail || 'Failed to add monitor. Verify the endpoint and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) reset(); }}>
      <DialogTrigger asChild>
        <Button size="lg">
          <Plus className="w-4 h-4" />
          Add monitor
        </Button>
      </DialogTrigger>

      <DialogContent className={monitorType === MonitorType.Journey ? 'sm:max-w-[560px] max-h-[85vh] overflow-y-auto' : 'sm:max-w-[450px]'}>
        <DialogHeader>
          <DialogTitle>Add monitor</DialogTitle>
          <DialogDescription>
            Register a new endpoint for uptime and security auditing.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2">
          <Button
            variant={monitorType === MonitorType.Http ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMonitorType(MonitorType.Http)}
          >
            Classic
          </Button>
          <Button
            variant={monitorType === MonitorType.Journey ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMonitorType(MonitorType.Journey)}
          >
            Journey
          </Button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="add-monitor-name">Friendly Name</Label>
            <Input
              id="add-monitor-name"
              placeholder="Production Gateway"
              value={friendlyName}
              onChange={(e) => setFriendlyName(e.target.value)}
            />
          </div>

          {monitorType === MonitorType.Http ? (
            <div className="flex flex-col gap-2">
              <Label htmlFor="add-monitor-url">Target URL</Label>
              <Input
                id="add-monitor-url"
                placeholder="https://api.example.com/health"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="font-mono text-sm"
              />
            </div>
          ) : (
            <JourneyStepBuilder steps={steps} onChange={setSteps} />
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {isLoading ? 'Adding...' : 'Add monitor'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
