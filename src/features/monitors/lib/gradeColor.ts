// src/features/monitors/lib/gradeColor.ts
export interface GradeColor {
  badgeClass: string;
  textClass: string;
  label: string;
}

const GRADE_COLORS: Record<string, GradeColor> = {
  A: { badgeClass: 'border-primary/20 bg-accent text-accent-foreground', textClass: 'text-primary', label: 'Excellent' },
  B: { badgeClass: 'border-green-200 bg-green-50 text-green-700', textClass: 'text-green-600', label: 'Good' },
  C: { badgeClass: 'border-amber-200 bg-amber-50 text-amber-700', textClass: 'text-amber-600', label: 'Needs Improvement' },
  D: { badgeClass: 'border-red-200 bg-red-50 text-red-700', textClass: 'text-red-600', label: 'Poor' },
  F: { badgeClass: 'border-red-200 bg-red-50 text-red-700', textClass: 'text-red-600', label: 'Critical' },
};

const UNKNOWN_GRADE_COLOR: GradeColor = {
  badgeClass: 'border-zinc-200 bg-zinc-50 text-zinc-600',
  textClass: 'text-zinc-500',
  label: 'Pending',
};

export const getGradeColor = (grade: string): GradeColor => GRADE_COLORS[grade] ?? UNKNOWN_GRADE_COLOR;
