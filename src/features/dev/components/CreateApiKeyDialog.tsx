// src/features/dev/components/CreateApiKeyDialog.tsx
import { useState } from 'react';
import { Dialog, Button, TextField, Text, Flex, Box, Code } from '@radix-ui/themes';
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
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger>
        <Button className="bg-blue-500 hover:bg-blue-600 text-white font-onest cursor-pointer" style={{ borderRadius: 0 }}>
          <Plus size={14} strokeWidth={1} />
          New key
        </Button>
      </Dialog.Trigger>
      <Dialog.Content className="bg-white border border-zinc-200 font-onest" style={{ borderRadius: 0 }} maxWidth="450px" aria-describedby={undefined}>
        <Dialog.Title className="text-zinc-900 font-unbounded font-bold">
          {createdKey ? 'Key Created' : 'New API Key'}
        </Dialog.Title>

        {!createdKey ? (
          <Flex direction="column" gap="4" className="mt-2">
            <Box>
              <Text size="2" className="text-zinc-700 font-onest block mb-2">Label</Text>
              <TextField.Root
                placeholder="e.g. CI pipeline"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="font-onest bg-white border-zinc-300 text-zinc-900"
                style={{ borderRadius: 0 }}
              />
            </Box>
            <Flex gap="3" justify="end">
              <Dialog.Close>
                <Button variant="soft" className="bg-zinc-100 text-zinc-900 font-onest cursor-pointer" style={{ borderRadius: 0 }}>
                  Cancel
                </Button>
              </Dialog.Close>
              <Button
                disabled={!label.trim() || createKey.isPending}
                onClick={() => createKey.mutate()}
                className="bg-blue-500 hover:bg-blue-600 text-white font-onest cursor-pointer"
                style={{ borderRadius: 0 }}
              >
                {createKey.isPending ? 'Creating...' : 'Create'}
              </Button>
            </Flex>
          </Flex>
        ) : (
          <Flex direction="column" gap="4" className="mt-2">
            <Text size="2" className="text-red-600 font-onest">
              Copy this now — you won't be able to see it again.
            </Text>
            <Box className="bg-zinc-50 border border-zinc-200 p-3 flex items-center justify-between gap-3">
              <Code variant="ghost" className="text-zinc-700 font-mono text-sm break-all">{createdKey.rawKey}</Code>
              <Button variant="ghost" className="cursor-pointer text-zinc-500 shrink-0" onClick={copyKey}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </Button>
            </Box>
            <Flex justify="end">
              <Dialog.Close>
                <Button className="bg-black text-white font-onest cursor-pointer" style={{ borderRadius: 0 }}>
                  Done
                </Button>
              </Dialog.Close>
            </Flex>
          </Flex>
        )}
      </Dialog.Content>
    </Dialog.Root>
  );
};
