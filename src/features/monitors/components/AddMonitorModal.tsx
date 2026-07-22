// src/features/monitors/components/AddMonitorModal.tsx
import { useState } from 'react';
import axios from 'axios';
import { Dialog, Button, TextField, Text, Flex } from '@radix-ui/themes';
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
      setError(detail || 'Failed to deploy monitor. Verify the endpoint and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger>
        <Button 
          size="3" 
          color="blue" 
          variant="solid" 
          className="cursor-pointer font-mono uppercase tracking-widest text-xs"
        >
          <Plus strokeWidth={1} className="w-4 h-4 mr-2" />
          Add Target
        </Button>
      </Dialog.Trigger>

      <Dialog.Content
        className="bg-white border border-zinc-200 !rounded-none"
        style={{ maxWidth: 450 }}
      >
        <Dialog.Title className="font-heading font-black text-xl text-zinc-900 mb-2">
          Deploy Target
        </Dialog.Title>
        <Dialog.Description className="font-sans text-zinc-500 text-sm mb-6">
          Register a new endpoint for high-frequency telemetry and security audits.
        </Dialog.Description>

        <Flex direction="column" gap="4">
          <label>
            <Text as="div" size="2" mb="2" className="font-sans text-zinc-700 font-bold text-xs uppercase tracking-widest">
              Target URL
            </Text>
            <TextField.Root 
              size="3"
              placeholder="https://api.example.com/health"
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
              placeholder="Production Gateway"
              value={friendlyName}
              onChange={(e) => setFriendlyName(e.target.value)}
              className="font-sans text-sm"
              variant="surface"
              color="gray"
            />
          </label>

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
            disabled={isLoading}
            color="blue"
            className="cursor-pointer font-mono"
          >
            {isLoading ? <Loader2 strokeWidth={1} className="w-4 h-4 animate-spin mr-2" /> : null}
            {isLoading ? 'Deploying...' : 'Initialize'}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};