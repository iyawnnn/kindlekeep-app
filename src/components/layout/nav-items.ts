// src/components/layout/nav-items.ts
import {
  LayoutDashboard,
  ShieldAlert,
  Lock,
  BadgeCheck,
  Settings as SettingsIcon,
  IdCard,
  Terminal,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
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
