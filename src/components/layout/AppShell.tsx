// src/components/layout/AppShell.tsx
import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Box, Flex, Text } from '@radix-ui/themes';
import { Menu } from 'lucide-react';
import { Sidebar } from './Sidebar';

export const AppShell = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box className="min-h-screen bg-white font-onest text-zinc-900 flex">
      <Sidebar mobileOpen={mobileOpen} onMobileOpenChange={setMobileOpen} />
      <Flex direction="column" className="flex-1 min-w-0">
        <div className="lg:hidden sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur-md">
          <Flex align="center" justify="between" className="px-4 h-14">
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="p-2 -ml-2 text-zinc-700 cursor-pointer"
            >
              <Menu size={20} strokeWidth={1} />
            </button>
            <Link to="/dashboard">
              <Text className="font-wordmark text-lg text-black tracking-tight lowercase">
                kindlekeep
              </Text>
            </Link>
            <div className="w-9" />
          </Flex>
        </div>
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </Flex>
    </Box>
  );
};
