// src/features/dev/components/ApiKeyList.tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
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
    <div className="rounded-xl bg-white border border-zinc-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <p className="text-xl font-semibold text-zinc-900">API Keys</p>
        <CreateApiKeyDialog />
      </div>

      {isLoading ? (
        <p className="text-zinc-500">Loading keys...</p>
      ) : !keys || keys.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-8 rounded-lg border border-dashed border-zinc-300 bg-zinc-50 text-center">
          <KeyRound size={24} strokeWidth={1.5} className="text-zinc-400" />
          <p className="text-sm text-zinc-500">No API keys yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {keys.map((key) => (
            <div key={key.id} className="flex items-center justify-between p-3 rounded-lg border border-zinc-200 bg-zinc-50">
              <div>
                <p className="text-zinc-900">{key.label}</p>
                <p className="text-xs text-zinc-500 font-mono">
                  Created {new Date(key.createdAt).toLocaleDateString()}
                  {key.lastUsedAt ? ` · last used ${new Date(key.lastUsedAt).toLocaleDateString()}` : ' · never used'}
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="text-zinc-400 hover:text-red-600 transition-colors cursor-pointer">
                    <Trash2 size={16} />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogTitle>Revoke Key</AlertDialogTitle>
                  <AlertDialogDescription>
                    Revoke <strong>{key.label}</strong>? Anything using this key will stop working immediately.
                  </AlertDialogDescription>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-600 text-white hover:bg-red-700"
                      onClick={() => revokeKey.mutate(key.id)}
                    >
                      Revoke
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
