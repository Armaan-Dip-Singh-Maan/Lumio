-- Idempotency for Clerk → welcome email (Google OAuth first sign-up)
create table if not exists public.welcome_email_log (
  clerk_user_id text primary key,
  sent_at timestamptz not null default now()
);

alter table public.welcome_email_log enable row level security;

comment on table public.welcome_email_log is 'Tracks welcome emails sent via clerk-welcome-email Edge Function; service role only.';
