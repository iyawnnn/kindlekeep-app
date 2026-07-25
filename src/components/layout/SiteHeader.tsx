// src/components/layout/SiteHeader.tsx
import { useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { NAV_GROUPS } from './nav-items';

interface SiteHeaderProps {
  onSearchClick: () => void;
}

export const SiteHeader = ({ onSearchClick }: SiteHeaderProps) => {
  const location = useLocation();

  const activeGroup = NAV_GROUPS.find((group) =>
    group.items.some((item) => location.pathname.startsWith(item.to))
  );
  const activeItem = activeGroup?.items.find((item) => location.pathname.startsWith(item.to));

  return (
    <header className="sticky top-0 z-40 flex h-14 w-full shrink-0 items-center gap-2 border-b border-zinc-200 bg-white/80 px-4 backdrop-blur-sm">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-4" />
      {activeGroup && activeItem ? (
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden sm:block text-zinc-400">
              {activeGroup.title}
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden sm:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>{activeItem.label}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      ) : (
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="" className="size-6 rounded-md" />
          <span className="text-lg font-semibold text-black tracking-tight lowercase">
            kindlekeep
          </span>
        </div>
      )}
      <button
        onClick={onSearchClick}
        className="ml-auto flex w-full max-w-24 sm:max-w-64 items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-500 transition-colors hover:border-zinc-300 hover:bg-zinc-100 cursor-pointer"
      >
        <Search className="size-4 shrink-0" />
        <span className="hidden sm:inline truncate">Type to search...</span>
        <kbd className="ml-auto hidden sm:inline-flex h-5 items-center gap-0.5 rounded border border-zinc-300 bg-white px-1.5 font-mono text-[10px] text-zinc-500">
          ⌘K
        </kbd>
      </button>
    </header>
  );
};
