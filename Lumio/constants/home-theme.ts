/**
 * Lumio Home Page Theme
 * Calm, emotionally safe design system (light + dark)
 */

export type HomePalette = {
  background: string;
  foreground: string;
  card: string;
  cardBorder: string;
  cardShadow: string;
  primary: string;
  primaryForeground: string;
  muted: string;
  border: string;
  priorityHigh: string;
  priorityMedium: string;
  priorityLow: string;
  glassBackground: string;
  glassBorder: string;
  glassShadow: string;
};

/** Dark — warm, low-contrast (default Lumio look) */
export const HomeColorsDark: HomePalette = {
  background: 'hsl(30, 8%, 8%)',
  foreground: 'hsl(40, 20%, 92%)',
  card: 'hsla(30, 6%, 14%, 0.7)',
  cardBorder: 'hsla(40, 10%, 25%, 0.3)',
  cardShadow: 'hsla(0, 0%, 0%, 0.15)',
  primary: 'hsl(163, 20%, 60%)',
  primaryForeground: 'hsl(30, 8%, 8%)',
  muted: 'hsl(40, 10%, 58%)',
  border: 'hsl(30, 6%, 20%)',
  priorityHigh: 'hsl(10, 40%, 55%)',
  priorityMedium: 'hsl(40, 50%, 60%)',
  priorityLow: 'hsl(163, 15%, 50%)',
  glassBackground: 'hsla(30, 6%, 16%, 0.75)',
  glassBorder: 'hsla(40, 10%, 28%, 0.4)',
  glassShadow: '0 8px 32px -8px hsla(0, 0%, 0%, 0.25)',
};

/** Light — soft paper, sage accents */
export const HomeColorsLight: HomePalette = {
  background: 'hsl(40, 20%, 97%)',
  foreground: 'hsl(30, 12%, 18%)',
  card: 'hsla(40, 25%, 99%, 0.85)',
  cardBorder: 'hsla(30, 15%, 82%, 0.6)',
  cardShadow: 'hsla(30, 10%, 50%, 0.08)',
  primary: 'hsl(163, 22%, 38%)',
  primaryForeground: 'hsl(40, 25%, 99%)',
  muted: 'hsl(30, 8%, 42%)',
  border: 'hsl(35, 12%, 88%)',
  priorityHigh: 'hsl(10, 35%, 48%)',
  priorityMedium: 'hsl(40, 40%, 45%)',
  priorityLow: 'hsl(163, 18%, 40%)',
  glassBackground: 'hsla(40, 30%, 100%, 0.72)',
  glassBorder: 'hsla(30, 12%, 78%, 0.45)',
  glassShadow: '0 8px 28px -6px hsla(30, 15%, 50%, 0.12)',
};

export function getHomeColors(mode: 'light' | 'dark'): HomePalette {
  return mode === 'light' ? HomeColorsLight : HomeColorsDark;
}

/** @deprecated Use getHomeColors / useTheme() for resolved palette */
export const HomeColors: HomePalette = { ...HomeColorsDark };

export const HomeSpacing = {
  xs: 8,
  sm: 12,
  md: 20,
  lg: 32,
  xl: 48,
  xxl: 64,
} as const;

export const HomeTypography = {
  fontFamily: 'System',
  fontWeight: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 24,
    '2xl': 30,
    '3xl': 36,
  },
  letterSpacing: 0.01,
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.8,
  },
} as const;

