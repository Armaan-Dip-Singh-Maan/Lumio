/**
 * Lumio-branded Clerk SDK appearance (covers any Clerk UI surfaces, e.g. future UserButton).
 * Pro: remove “Powered by Clerk” in Clerk Dashboard → Email & branding, not only here.
 *
 * Dashboard checklist (verification emails):
 * - Email → Templates → Verification code (email_code): Lumio copy, logo, footer without Clerk branding.
 */
export const clerkAppearance = {
  layout: {
    logoPlacement: 'none',
  },
  variables: {
    colorPrimary: 'hsl(163, 20%, 60%)',
    colorBackground: 'hsl(30, 8%, 8%)',
    colorText: 'hsl(40, 20%, 92%)',
    colorTextSecondary: 'hsl(40, 10%, 58%)',
    colorNeutral: 'hsl(30, 6%, 20%)',
    borderRadius: '0.75rem',
    fontFamily: 'System',
  },
} as const;
