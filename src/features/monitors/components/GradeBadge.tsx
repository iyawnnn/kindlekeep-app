// src/features/monitors/components/GradeBadge.tsx
import { getGradeColor } from '../lib/gradeColor';

interface GradeBadgeProps {
  grade: string;
  size?: 'md' | 'lg' | 'xl';
  showLabel?: boolean;
}

const SIZE_CLASSES: Record<NonNullable<GradeBadgeProps['size']>, string> = {
  md: 'w-10 h-10 text-xl',
  lg: 'w-16 h-16 text-3xl',
  xl: 'w-24 h-24 text-6xl',
};

export const GradeBadge = ({ grade, size = 'lg', showLabel = false }: GradeBadgeProps) => {
  const color = getGradeColor(grade);

  return (
    <div className="flex flex-col items-center gap-2 shrink-0">
      <div
        className={`flex items-center justify-center shrink-0 rounded-lg border font-bold ${SIZE_CLASSES[size]} ${color.badgeClass}`}
      >
        {grade}
      </div>
      {showLabel && (
        <span className={`text-xs font-semibold ${color.textClass}`}>{color.label}</span>
      )}
    </div>
  );
};
