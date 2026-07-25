// src/features/dev/components/CreateApiKeyDialog.tsx
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Check, Plus } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/axios';
import { useToastStore } from '../../../components/ui/useToastStore';

interface ApiKeyCreatedResponse {
  id: string;
  label: string;
  rawKey: string;
  createdAt: string;
}

export const CreateApiKeyDialog = () => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [createdKey, setCreatedKey] = useState<ApiKeyCreatedResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const createKey = useMutation({
    mutationFn: async () => {
      const response = await api.post<ApiKeyCreatedResponse>('/api/dev/keys', { label });
      return response.data;
    },
    onSuccess: (data) => {
      setCreatedKey(data);
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
    },
    onError: () => {
      useToastStore.getState().error('Failed to create API key.');
    },
  });

  const copyKey = async () => {
    if (!createdKey) return;
    await navigator.clipboard.writeText(createdKey.rawKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setLabel('');
      setCreatedKey(null);
      setCopied(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus size={14} strokeWidth={1.5} />
          New key
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]" aria-describedby={undefined}>
        <DialogTitle>{createdKey ? 'Key Created' : 'New API Key'}</DialogTitle>

        {!createdKey ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="api-key-label">Label</Label>
              <Input
                id="api-key-label"
                placeholder="e.g. CI pipeline"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                disabled={!label.trim() || createKey.isPending}
                onClick={() => createKey.mutate()}
              >
                {createKey.isPending ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-red-600">
              Copy this now — you won't be able to see it again.
            </p>
            <div className="flex items-center justify-between gap-3 rounded-lg bg-zinc-50 border border-zinc-200 p-3">
              <code className="text-zinc-700 font-mono text-sm break-all">{createdKey.rawKey}</code>
              <Button variant="ghost" size="icon" className="shrink-0 text-zinc-500" onClick={copyKey}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </Button>
            </div>
            <DialogFooter>
              <Button onClick={() => setOpen(false)}>Done</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
