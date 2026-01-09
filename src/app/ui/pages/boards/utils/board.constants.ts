import { Colors } from '../../../../domain/models/board.model';

export const COLORS: Colors[] = [
  'sky',
  'yellow',
  'green',
  'red',
  'violet',
  'gray',
  'white',
];

export const COLOR_MAP: Record<Colors, string> = {
  sky: 'bg-sky-500',
  yellow: 'bg-amber-500',
  green: 'bg-emerald-500',
  red: 'bg-rose-500',
  violet: 'bg-violet-500',
  gray: 'bg-slate-500',
  white: '',
};

export const BACKGROUND_MAP: Record<Colors, string> = {
  sky: 'bg-sky-300/80',
  yellow: 'bg-amber-300/80',
  green: 'bg-emerald-300/80',
  red: 'bg-rose-300/80',
  violet: 'bg-violet-300/80',
  gray: 'bg-slate-300/80',
  white: 'bg-white/80',
};

export const ADD_CARD_HOVER_MAP: Record<Colors, string> = {
  sky: 'hover:bg-sky-200/50',
  yellow: 'hover:bg-amber-200/50',
  green: 'hover:bg-emerald-200/50',
  red: 'hover:bg-rose-200/50',
  violet: 'hover:bg-violet-200/50',
  gray: 'hover:bg-slate-200/50',
  white: 'hover:bg-blue-200/50',
};

export const BUTTON_COLOR_MAP: Record<
  Colors,
  { bg: string; hover: string; border: string }
> = {
  sky: {
    bg: 'bg-sky-600',
    hover: 'hover:bg-sky-700',
    border: 'border-sky-500',
  },
  yellow: {
    bg: 'bg-amber-500',
    hover: 'hover:bg-amber-600',
    border: 'border-amber-400',
  },
  green: {
    bg: 'bg-emerald-600',
    hover: 'hover:bg-emerald-700',
    border: 'border-emerald-500',
  },
  red: {
    bg: 'bg-rose-600',
    hover: 'hover:bg-rose-700',
    border: 'border-rose-500',
  },
  violet: {
    bg: 'bg-violet-600',
    hover: 'hover:bg-violet-700',
    border: 'border-violet-500',
  },
  gray: {
    bg: 'bg-slate-600',
    hover: 'hover:bg-slate-700',
    border: 'border-slate-500',
  },
  white: {
    bg: 'bg-blue-600',
    hover: 'hover:bg-blue-700',
    border: 'border-blue-500',
  },
};
