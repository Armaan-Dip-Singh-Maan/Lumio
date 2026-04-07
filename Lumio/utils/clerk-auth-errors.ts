/**
 * Map Clerk API errors to friendly copy (no raw Clerk wording in the UI).
 */
export function clerkErrorToMessage(err: unknown, fallback: string): string {
  const e = err as {
    errors?: Array<{ code?: string; message?: string }>;
    message?: string;
  };
  const code = e?.errors?.[0]?.code;
  const raw = e?.errors?.[0]?.message || e?.message;

  switch (code) {
    case 'form_identifier_not_found':
      return "We couldn't find an account with that email.";
    case 'form_password_incorrect':
      return "That password doesn't seem right.";
    case 'form_code_incorrect':
      return "That code doesn't seem right.";
    case 'form_param_format_invalid':
      return 'Please check your email and try again.';
    case 'session_exists':
      return "You're already signed in.";
    case 'oauth_access_denied':
    case 'oauth_callback_error':
      return 'Sign in was cancelled.';
    case 'client_state_invalid':
      return 'Authentication expired. Please try again.';
    case 'session_not_found':
      return 'Your session expired. Please sign in again.';
    case 'user_locked':
      return 'This account is temporarily locked. Try again later or reset your password.';
    case 'rate_limit_exceeded':
      return 'Too many attempts. Please wait a moment and try again.';
    default:
      if (raw && typeof raw === 'string' && !raw.toLowerCase().includes('clerk')) {
        return raw;
      }
      return fallback;
  }
}
