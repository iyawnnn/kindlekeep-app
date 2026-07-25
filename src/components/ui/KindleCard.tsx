// src/components/ui/KindleCard.tsx
import type { ComponentProps, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface KindleCardProps extends ComponentProps<typeof motion.div> {
  isActive: boolean;
  children: ReactNode;
}

const springConfig = {
  type: "spring",
  stiffness: 300,
  damping: 25
} as const;

export const KindleCard = ({ isActive, children, className = '', ...props }: KindleCardProps) => {
  return (
    <motion.div
      layout
      transition={springConfig}
      className={`relative flex flex-col p-5 bg-white border border-zinc-200 shadow-sm hover:shadow-md transition-shadow duration-150 rounded-xl ${isActive ? '' : 'opacity-50'} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};