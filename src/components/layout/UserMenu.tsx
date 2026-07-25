// src/components/layout/UserMenu.tsx
import { DropdownMenu, Flex, Text } from '@radix-ui/themes';
import { User, LogOut, IdCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/axios';

interface UserMenuProps {
  collapsed: boolean;
}

interface UserProfileResponse {
  displayName: string;
  email: string;
  avatarUrl: string | null;
  authProvider: string;
}

export const UserMenu = ({ collapsed }: UserMenuProps) => {
  const navigate = useNavigate();

  const { data: profile } = useQuery<UserProfileResponse>({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await api.get('/api/users/profile');
      return response.data;
    },
    retry: false,
  });

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    navigate('/');
  };

  return (
    <div className="border-t border-zinc-200 p-3 shrink-0">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <button className="w-full flex items-center gap-3 px-2 py-2 text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer">
            {profile?.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.displayName} className="w-7 h-7 border border-zinc-200 shrink-0" />
            ) : (
              <div className="w-7 h-7 flex items-center justify-center bg-zinc-100 border border-zinc-200 shrink-0">
                <User size={16} strokeWidth={1} />
              </div>
            )}
            {!collapsed && (
              <Text className="text-sm font-medium font-onest truncate">
                {profile?.displayName ?? 'Account'}
              </Text>
            )}
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content className="font-onest" style={{ borderRadius: 0 }}>
          <DropdownMenu.Item className="cursor-pointer" onSelect={() => navigate('/account')}>
            <Flex align="center" gap="2">
              <IdCard size={14} strokeWidth={1} />
              Identity
            </Flex>
          </DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.Item className="cursor-pointer" color="red" onSelect={handleLogout}>
            <Flex align="center" gap="2">
              <LogOut size={14} strokeWidth={1} />
              Logout
            </Flex>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </div>
  );
};
