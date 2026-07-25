// src/features/dev/components/ApiKeyList.tsx
import { AlertDialog, Box, Button, Flex, Text } from '@radix-ui/themes';
import { KeyRound, Trash2 } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/axios';
import { useToastStore } from '../../../components/ui/useToastStore';
import { CreateApiKeyDialog } from './CreateApiKeyDialog';

interface ApiKeyResponse {
  id: string;
  label: string;
  createdAt: string;
  lastUsedAt: string | null;
}

export const ApiKeyList = () => {
  const queryClient = useQueryClient();

  const { data: keys, isLoading } = useQuery<ApiKeyResponse[]>({
    queryKey: ['apiKeys'],
    queryFn: async () => {
      const response = await api.get('/api/dev/keys');
      return response.data;
    },
  });

  const revokeKey = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/dev/keys/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
    },
    onError: () => {
      useToastStore.getState().error('Failed to revoke key.');
    },
  });

  return (
    <Box className="bg-white border border-zinc-200 shadow-sm p-6" style={{ borderRadius: 0 }}>
      <Flex align="center" justify="between" className="mb-6">
        <Text className="font-unbounded font-bold text-xl text-zinc-900">API Keys</Text>
        <CreateApiKeyDialog />
      </Flex>

      {isLoading ? (
        <Text className="text-zinc-500 font-onest">Loading keys...</Text>
      ) : !keys || keys.length === 0 ? (
        <Flex direction="column" align="center" justify="center" gap="2" className="py-8 border border-dashed border-zinc-300 bg-zinc-50 text-center">
          <KeyRound size={24} strokeWidth={1} className="text-zinc-400" />
          <Text size="2" className="text-zinc-500 font-onest">No API keys yet.</Text>
        </Flex>
      ) : (
        <Flex direction="column" gap="2">
          {keys.map((key) => (
            <Flex key={key.id} align="center" justify="between" className="p-3 border border-zinc-200 bg-zinc-50">
              <Box>
                <Text className="text-zinc-900 font-onest block">{key.label}</Text>
                <Text size="1" className="text-zinc-500 font-mono">
                  Created {new Date(key.createdAt).toLocaleDateString()}
                  {key.lastUsedAt ? ` · last used ${new Date(key.lastUsedAt).toLocaleDateString()}` : ' · never used'}
                </Text>
              </Box>
              <AlertDialog.Root>
                <AlertDialog.Trigger>
                  <button className="text-zinc-400 hover:text-red-600 transition-colors cursor-pointer">
                    <Trash2 size={16} />
                  </button>
                </AlertDialog.Trigger>
                <AlertDialog.Content className="bg-white border border-zinc-200" style={{ borderRadius: 0 }} maxWidth="400px">
                  <AlertDialog.Title className="text-zinc-900 font-unbounded font-bold">Revoke Key</AlertDialog.Title>
                  <AlertDialog.Description size="2" className="text-zinc-600 font-onest mb-4">
                    Revoke <strong>{key.label}</strong>? Anything using this key will stop working immediately.
                  </AlertDialog.Description>
                  <Flex gap="3" justify="end">
                    <AlertDialog.Cancel>
                      <Button variant="soft" className="bg-zinc-100 text-zinc-900 font-onest cursor-pointer" style={{ borderRadius: 0 }}>
                        Cancel
                      </Button>
                    </AlertDialog.Cancel>
                    <AlertDialog.Action>
                      <Button
                        variant="solid"
                        color="red"
                        className="bg-red-600 text-white font-onest cursor-pointer"
                        style={{ borderRadius: 0 }}
                        onClick={() => revokeKey.mutate(key.id)}
                      >
                        Revoke
                      </Button>
                    </AlertDialog.Action>
                  </Flex>
                </AlertDialog.Content>
              </AlertDialog.Root>
            </Flex>
          ))}
        </Flex>
      )}
    </Box>
  );
};
