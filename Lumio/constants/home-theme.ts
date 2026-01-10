/**
 * Lumio Home Page Theme
 * Calm, emotionally safe design system
 */

export const HomeColors = {
  background: 'hsl(30, 8%, 8%)', // Dark, warm background
  foreground: 'hsl(40, 20%, 92%)', // Soft foreground text
  card: 'hsla(30, 6%, 14%, 0.7)', // Glassmorphism card background
  cardBorder: 'hsla(40, 10%, 25%, 0.3)', // Soft border
  cardShadow: 'hsla(0, 0%, 0%, 0.15)', // Subtle shadow
  primary: 'hsl(163, 20%, 60%)', // Sage green
  primaryForeground: 'hsl(30, 8%, 8%)',
  muted: 'hsl(40, 10%, 55%)', // Muted text
  border: 'hsl(30, 6%, 20%)',
  
  // Priority colors (muted, never aggressive)
  priorityHigh: 'hsl(10, 40%, 55%)', // Soft coral (NOT red)
  priorityMedium: 'hsl(40, 50%, 60%)', // Warm amber
  priorityLow: 'hsl(163, 15%, 50%)', // Sage / cool gray
  
  // Glass effect
  glassBackground: 'hsla(30, 6%, 14%, 0.7)',
  glassBorder: 'hsla(40, 10%, 25%, 0.3)',
  glassShadow: '0 8px 32px -8px hsla(0, 0%, 0%, 0.2)',
} as const;

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

