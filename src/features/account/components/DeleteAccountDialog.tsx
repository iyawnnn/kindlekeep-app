// src/features/account/components/DeleteAccountDialog.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    <AlertDialog onOpenChange={(open) => !open && setConfirmText('')}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700">
          <Trash2 size={14} strokeWidth={1.5} />
          Delete account
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle>Delete Account</AlertDialogTitle>
        <AlertDialogDescription>
          This permanently deletes your account and every monitor, uptime log, security audit,
          and incident tied to it. This cannot be undone.
        </AlertDialogDescription>

        <div>
          <p className="text-sm text-zinc-700 mb-2">
            Type <strong>{CONFIRM_PHRASE}</strong> to confirm.
          </p>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={confirmText !== CONFIRM_PHRASE || isDeleting}
            onClick={handleDelete}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            {isDeleting ? 'Deleting...' : 'Delete Account'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
