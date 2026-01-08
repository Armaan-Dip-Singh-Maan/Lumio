/**
 * Lumio Authentication Theme
 * Calm, emotionally safe color palette
 */

export const AuthColors = {
  background: 'hsl(30, 8%, 8%)',
  foreground: 'hsl(40, 20%, 92%)',
  card: 'hsl(30, 6%, 12%)',
  primary: 'hsl(163, 20%, 60%)', // Sage green
  primaryForeground: 'hsl(30, 8%, 8%)',
  muted: 'hsl(40, 10%, 55%)',
  border: 'hsl(30, 6%, 20%)',
  glassCard: 'hsla(30, 6%, 14%, 0.7)',
  glassBorder: 'hsla(40, 10%, 25%, 0.3)',
} as const;

export const AuthSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const AuthTypography = {
  fontFamily: 'System', // Will use DM Sans when loaded
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
    xl: 20,
    '2xl': 24,
    '3xl': 30,
  },
  letterSpacing: 0.01,
} as const;

