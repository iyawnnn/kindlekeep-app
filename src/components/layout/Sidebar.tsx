// src/components/layout/Sidebar.tsx
import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Dialog, Box, Flex, Text } from '@radix-ui/themes';
import {
  LayoutDashboard,
  ShieldAlert,
  Lock,
  BadgeCheck,
  Settings as SettingsIcon,
  IdCard,
  Terminal,
  ChevronsLeft,
  ChevronsRight,
  type LucideIcon,
} from 'lucide-react';
import { UserMenu } from './UserMenu';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Monitoring',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/incidents', label: 'Incidents', icon: ShieldAlert },
    ],
  },
  {
    title: 'Security',
    items: [
      { to: '/vault', label: 'Sentinel Vault', icon: Lock },
      { to: '/badges', label: 'Badges', icon: BadgeCheck },
    ],
  },
  {
    title: 'Account',
    items: [
      { to: '/settings', label: 'Settings', icon: SettingsIcon },
      { to: '/account', label: 'Identity', icon: IdCard },
      { to: '/dev', label: 'Dev / API', icon: Terminal },
    ],
  },
];

interface SidebarContentProps {
  collapsed: boolean;
  onNavigate: () => void;
}

const SidebarContent = ({ collapsed, onNavigate }: SidebarContentProps) => (
  <Flex direction="column" className="flex-1 min-h-0">
    <Link
      to="/dashboard"
      onClick={onNavigate}
      className="px-5 h-16 flex items-center border-b border-zinc-200 shrink-0"
    >
      <Text className="font-wordmark text-xl text-black tracking-tight lowercase">
        {collapsed ? 'kk' : 'kindlekeep'}
      </Text>
    </Link>
    <nav className="flex-1 min-h-0 overflow-y-auto py-4 px-3 flex flex-col gap-6">
      {NAV_GROUPS.map((group) => (
        <div key={group.title}>
          {!collapsed && (
            <Text className="text-xs font-semibold uppercase tracking-wider text-zinc-400 px-2 mb-2 block font-onest">
              {group.title}
            </Text>
          )}
          <Flex direction="column" gap="1">
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onNavigate}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-2 py-2 border-l-2 transition-colors ${
                    isActive
                      ? 'text-blue-600 border-blue-500 bg-blue-50'
                      : 'text-zinc-500 border-transparent hover:text-black hover:bg-zinc-50'
                  }`
                }
              >
                <item.icon size={18} strokeWidth={1} className="shrink-0" />
                {!collapsed && <span className="text-sm font-medium font-onest">{item.label}</span>}
              </NavLink>
            ))}
          </Flex>
        </div>
      ))}
    </nav>
    <UserMenu collapsed={collapsed} />
  </Flex>
);

interface SidebarProps {
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
}

export const Sidebar = ({ mobileOpen, onMobileOpenChange }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('kk_sidebar_collapsed') === 'true'
  );

  useEffect(() => {
    localStorage.setItem('kk_sidebar_collapsed', String(collapsed));
  }, [collapsed]);

  return (
    <>
      <Box
        className={`hidden lg:flex flex-col border-r border-zinc-200 bg-white sticky top-0 h-screen shrink-0 transition-[width] duration-200 ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        <SidebarContent collapsed={collapsed} onNavigate={() => {}} />
        <button
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="flex items-center justify-center py-3 border-t border-zinc-200 text-zinc-500 hover:text-black transition-colors cursor-pointer shrink-0"
        >
          {collapsed ? (
            <ChevronsRight size={18} strokeWidth={1} />
          ) : (
            <ChevronsLeft size={18} strokeWidth={1} />
          )}
        </button>
      </Box>

      <Dialog.Root open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <Dialog.Content
          aria-describedby={undefined}
          className="bg-white border-r border-zinc-200 font-onest p-0 fixed inset-y-0 left-0 h-screen w-72 max-w-[85vw] flex flex-col"
          style={{ borderRadius: 0, margin: 0 }}
        >
          <Dialog.Title className="sr-only">Navigation</Dialog.Title>
          <SidebarContent collapsed={false} onNavigate={() => onMobileOpenChange(false)} />
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
};
