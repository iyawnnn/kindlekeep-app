// src/components/layout/Sidebar.tsx
import { Link, NavLink, useLocation } from 'react-router-dom';
import { LifeBuoy, Send } from 'lucide-react';
import {
  Sidebar as SidebarPrimitive,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';

const SECONDARY_LINKS = [
  { label: 'Support', href: 'https://iansebastian.dev', icon: LifeBuoy },
  { label: 'Feedback', href: 'https://iansebastian.dev', icon: Send },
];
import { UserMenu } from './UserMenu';
import { NAV_GROUPS } from './nav-items';

export const Sidebar = () => {
  const location = useLocation();

  return (
    <SidebarPrimitive collapsible="icon" className="top-14 h-[calc(100svh-3.5rem)]!">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/dashboard">
                <img src="/logo.png" alt="" className="size-8 rounded-md shrink-0" />
                <span className="truncate text-base font-semibold text-black tracking-tight lowercase">
                  kindlekeep
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {NAV_GROUPS.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname.startsWith(item.to)}
                      tooltip={item.label}
                    >
                      <NavLink to={item.to}>
                        <item.icon strokeWidth={1.5} />
                        <span>{item.label}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {SECONDARY_LINKS.map((link) => (
                <SidebarMenuItem key={link.label}>
                  <SidebarMenuButton asChild size="sm" tooltip={link.label}>
                    <a href={link.href} target="_blank" rel="noopener noreferrer">
                      <link.icon strokeWidth={1.5} />
                      <span>{link.label}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <UserMenu />
      </SidebarFooter>
      <SidebarRail />
    </SidebarPrimitive>
  );
};
