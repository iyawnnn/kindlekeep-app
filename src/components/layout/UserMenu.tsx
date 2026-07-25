// src/components/layout/UserMenu.tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { User, LogOut, IdCard, ChevronsUpDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/axios';

interface UserProfileResponse {
  displayName: string;
  email: string;
  avatarUrl: string | null;
  authProvider: string;
}

export const UserMenu = () => {
  const navigate = useNavigate();
  const { isMobile } = useSidebar();

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
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              {profile?.avatarUrl ? (
                <img src={profile.avatarUrl} alt={profile.displayName} className="size-7 rounded-full border border-zinc-200 shrink-0" />
              ) : (
                <div className="size-7 flex items-center justify-center rounded-full bg-zinc-100 border border-zinc-200 shrink-0">
                  <User size={16} strokeWidth={1.5} />
                </div>
              )}
              <span className="truncate">{profile?.displayName ?? 'Account'}</span>
              <ChevronsUpDown className="ml-auto size-4 text-zinc-400" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent side={isMobile ? 'bottom' : 'right'} align="end" className="w-56">
            <DropdownMenuItem className="cursor-pointer gap-2" onSelect={() => navigate('/account')}>
              <IdCard size={14} strokeWidth={1.5} />
              Identity
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" className="cursor-pointer gap-2" onSelect={handleLogout}>
              <LogOut size={14} strokeWidth={1.5} />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
