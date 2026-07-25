// src/pages/Identity.tsx
import { useQuery } from '@tanstack/react-query';
import { User as UserIcon } from 'lucide-react';
import { api } from '../lib/axios';
import { ExportDataButton } from '../features/account/components/ExportDataButton';
import { DeleteAccountDialog } from '../features/account/components/DeleteAccountDialog';

interface UserProfileResponse {
  displayName: string;
  email: string;
  avatarUrl: string | null;
  authProvider: string;
}

export const Identity = () => {
  const { data: profile, isLoading } = useQuery<UserProfileResponse>({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await api.get('/api/users/profile');
      return response.data;
    },
  });

  return (
    <div className="max-w-3xl mx-auto py-10 px-6">
      <h1 className="text-3xl font-semibold text-black mb-8">
        Identity
      </h1>

      <div className="rounded-xl bg-white border border-zinc-200 shadow-sm p-6 mb-8">
        {isLoading ? (
          <p className="text-zinc-500">Loading profile...</p>
        ) : profile ? (
          <div className="flex items-center gap-4">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.displayName} className="w-16 h-16 rounded-full border border-zinc-200" />
            ) : (
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-zinc-100 border border-zinc-200 shrink-0">
                <UserIcon size={24} strokeWidth={1.5} className="text-zinc-500" />
              </div>
            )}
            <div>
              <p className="text-xl font-semibold text-zinc-900">{profile.displayName}</p>
              <p className="text-zinc-500 font-mono text-sm">{profile.email}</p>
              <div className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 mt-2">
                <span className="text-xs text-zinc-600 font-medium">
                  Signed in with {profile.authProvider}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-red-600">Failed to load profile.</p>
        )}
      </div>

      <div className="rounded-xl bg-white border border-zinc-200 shadow-sm p-6">
        <p className="text-xl font-semibold text-zinc-900 mb-2">
          Your Data
        </p>
        <p className="text-sm text-zinc-500 mb-6">
          Export everything kindlekeep has stored for your account, or permanently delete it.
        </p>
        <div className="flex gap-3">
          <ExportDataButton />
          <DeleteAccountDialog />
        </div>
      </div>
    </div>
  );
};
