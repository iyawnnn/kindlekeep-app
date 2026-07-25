// src/features/account/components/DeleteAccountDialog.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertDialog, Button, Flex, Text, TextField } from '@radix-ui/themes';
import { Trash2 } from 'lucide-react';
import { api } from '../../../lib/axios';
import { useToastStore } from '../../../components/ui/useToastStore';

const CONFIRM_PHRASE = 'DELETE';

export const DeleteAccountDialog = () => {
  const navigate = useNavigate();
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete('/api/users/me');
      localStorage.removeItem('jwt_token');
      navigate('/');
    } catch {
      useToastStore.getState().error('Failed to delete account.');
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog.Root onOpenChange={(open) => !open && setConfirmText('')}>
      <AlertDialog.Trigger>
        <Button
          variant="outline"
          color="red"
          className="cursor-pointer font-onest"
          style={{ borderRadius: 0 }}
        >
          <Trash2 size={14} strokeWidth={1} />
          Delete account
        </Button>
      </AlertDialog.Trigger>
      <AlertDialog.Content className="bg-white border border-zinc-200" style={{ borderRadius: 0 }} maxWidth="450px">
        <AlertDialog.Title className="text-zinc-900 font-unbounded font-bold">
          Delete Account
        </AlertDialog.Title>
        <AlertDialog.Description size="2" className="text-zinc-600 font-onest mb-4">
          This permanently deletes your account and every monitor, uptime log, security audit,
          and incident tied to it. This cannot be undone.
        </AlertDialog.Description>

        <Text size="2" className="text-zinc-700 font-onest block mb-2">
          Type <strong>{CONFIRM_PHRASE}</strong> to confirm.
        </Text>
        <TextField.Root
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          className="font-onest bg-white border-zinc-300 text-zinc-900 mb-4"
          style={{ borderRadius: 0 }}
        />

        <Flex gap="3" justify="end">
          <AlertDialog.Cancel>
            <Button variant="soft" className="bg-zinc-100 text-zinc-900 font-onest cursor-pointer" style={{ borderRadius: 0 }}>
              Cancel
            </Button>
          </AlertDialog.Cancel>
          <Button
            variant="solid"
            color="red"
            disabled={confirmText !== CONFIRM_PHRASE || isDeleting}
            onClick={handleDelete}
            className="bg-red-600 text-white font-onest cursor-pointer"
            style={{ borderRadius: 0 }}
          >
            {isDeleting ? 'Deleting...' : 'Delete Account'}
          </Button>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
};
