// src/pages/Identity.tsx
import { useQuery } from '@tanstack/react-query';
import { Box, Flex, Text } from '@radix-ui/themes';
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
    <Box className="max-w-3xl mx-auto py-10 px-6 font-onest">
      <Text className="font-unbounded font-bold text-3xl text-black block mb-8">
        Identity
      </Text>

      <Box className="bg-white border border-zinc-200 shadow-sm p-6 mb-8" style={{ borderRadius: 0 }}>
        {isLoading ? (
          <Text className="text-zinc-500 font-onest">Loading profile...</Text>
        ) : profile ? (
          <Flex align="center" gap="4">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.displayName} className="w-16 h-16 border border-zinc-200" />
            ) : (
              <Flex align="center" justify="center" className="w-16 h-16 bg-zinc-100 border border-zinc-200 shrink-0">
                <UserIcon size={24} strokeWidth={1} className="text-zinc-500" />
              </Flex>
            )}
            <Box>
              <Text className="font-unbounded font-bold text-xl text-zinc-900 block">{profile.displayName}</Text>
              <Text className="text-zinc-500 font-mono text-sm block">{profile.email}</Text>
              <Box className="inline-flex items-center border border-zinc-200 bg-zinc-50 px-2 py-0.5 mt-2">
                <Text size="1" className="text-zinc-600 uppercase tracking-wider font-bold">
                  Signed in with {profile.authProvider}
                </Text>
              </Box>
            </Box>
          </Flex>
        ) : (
          <Text className="text-red-600 font-onest">Failed to load profile.</Text>
        )}
      </Box>

      <Box className="bg-white border border-zinc-200 shadow-sm p-6" style={{ borderRadius: 0 }}>
        <Text className="font-unbounded font-bold text-xl text-zinc-900 block mb-2">
          Your Data
        </Text>
        <Text size="2" className="text-zinc-500 font-onest block mb-6">
          Export everything KindleKeep has stored for your account, or permanently delete it.
        </Text>
        <Flex gap="3">
          <ExportDataButton />
          <DeleteAccountDialog />
        </Flex>
      </Box>
    </Box>
  );
};
