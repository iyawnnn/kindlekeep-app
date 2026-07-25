// src/features/monitors/components/AddMonitorModal.tsx
import { useState } from 'react';
import axios from 'axios';
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
import { useMonitorStore } from '../store/useMonitorStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5247';

export const AddMonitorModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [friendlyName, setFriendlyName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { monitors, setMonitors } = useMonitorStore();

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

    setIsLoading(true);

    try {
      const token = localStorage.getItem('jwt_token');
      const response = await axios.post(
        `${API_BASE_URL}/api/monitors`,
        { url, friendlyName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setMonitors([...monitors, response.data]);
      setIsOpen(false);
      setUrl('');
      setFriendlyName('');
    } catch (err) {
      console.error('Failed to create monitor payload:', err);
      const detail = axios.isAxiosError(err) ? err.response?.data?.detail : undefined;
      setError(detail || 'Failed to add monitor. Verify the endpoint and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="lg">
          <Plus className="w-4 h-4" />
          Add monitor
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Add monitor</DialogTitle>
          <DialogDescription>
            Register a new endpoint for uptime and security auditing.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
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

          <div className="flex flex-col gap-2">
            <Label htmlFor="add-monitor-name">Friendly Name</Label>
            <Input
              id="add-monitor-name"
              placeholder="Production Gateway"
              value={friendlyName}
              onChange={(e) => setFriendlyName(e.target.value)}
            />
          </div>

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
