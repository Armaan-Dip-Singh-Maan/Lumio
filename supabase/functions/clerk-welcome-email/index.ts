/**
 * Clerk webhook: user.created → welcome email for first-time Google OAuth users only.
 *
 * Setup:
 * 1. Clerk Dashboard → Webhooks → Add endpoint → URL: https://<project>.supabase.co/functions/v1/clerk-welcome-email
 *    Subscribe to: user.created
 * 2. Copy signing secret → Supabase secret CLERK_WEBHOOK_SECRET (whsec_...)
 * 3. Resend: API key → RESEND_API_KEY; optional RESEND_FROM (default uses Resend onboarding domain)
 * 4. Run migration welcome_email_log.sql
 * 5. Deploy: supabase functions deploy clerk-welcome-email --no-verify-jwt
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { Webhook } from 'https://esm.sh/svix@1.37.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CLERK_WEBHOOK_SECRET = Deno.env.get('CLERK_WEBHOOK_SECRET');
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const RESEND_FROM =
  Deno.env.get('RESEND_FROM') || 'Lumio <onboarding@resend.dev>';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

interface ClerkUserCreated {
  type: string;
  data: {
    id: string;
    email_addresses?: Array<{ email_address?: string; id?: string }>;
    external_accounts?: Array<{ provider?: string }>;
  };
}

function isGoogleOAuthUser(data: ClerkUserCreated['data']): boolean {
  const accounts = data.external_accounts ?? [];
  return accounts.some(
    (a) =>
      a.provider === 'oauth_google' ||
      a.provider === 'google' ||
      String(a.provider ?? '').includes('google')
  );
}

function primaryEmail(data: ClerkUserCreated['data']): string | null {
  const list = data.email_addresses ?? [];
  const first = list[0]?.email_address;
  return first && first.includes('@') ? first : null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers':
          'authorization, x-client-info, apikey, content-type, svix-id, svix-timestamp, svix-signature',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  if (!CLERK_WEBHOOK_SECRET) {
    console.error('CLERK_WEBHOOK_SECRET is not set');
    return new Response(JSON.stringify({ error: 'Server misconfigured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const payload = await req.text();
  const svixId = req.headers.get('svix-id');
  const svixTimestamp = req.headers.get('svix-timestamp');
  const svixSignature = req.headers.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response(JSON.stringify({ error: 'Missing Svix headers' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let evt: ClerkUserCreated;
  try {
    const wh = new Webhook(CLERK_WEBHOOK_SECRET);
    evt = wh.verify(payload, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as ClerkUserCreated;
  } catch (e) {
    console.error('Webhook verify failed:', e);
    return new Response(JSON.stringify({ error: 'Invalid signature' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (evt.type !== 'user.created') {
    return new Response(JSON.stringify({ received: true, skipped: 'event type' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const userId = evt.data?.id;
  if (!userId) {
    return new Response(JSON.stringify({ received: true, skipped: 'no user id' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!isGoogleOAuthUser(evt.data)) {
    return new Response(JSON.stringify({ received: true, skipped: 'not google oauth' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const to = primaryEmail(evt.data);
  if (!to) {
    return new Response(JSON.stringify({ received: true, skipped: 'no email' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Supabase service env missing');
    return new Response(JSON.stringify({ error: 'Server misconfigured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const { error: reserveError } = await supabase
    .from('welcome_email_log')
    .insert({ clerk_user_id: userId });

  if (reserveError) {
    if (reserveError.code === '23505') {
      return new Response(JSON.stringify({ received: true, skipped: 'already sent' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    console.error('welcome_email_log insert:', reserveError);
    return new Response(JSON.stringify({ error: 'Database error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set — rolling back reservation');
    await supabase.from('welcome_email_log').delete().eq('clerk_user_id', userId);
    return new Response(
      JSON.stringify({ received: true, skipped: 'no resend key' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  const html = `
<!DOCTYPE html>
<html>
<body style="font-family: system-ui, sans-serif; line-height: 1.6; color: #1a1a1a;">
  <p>Welcome to Lumio.</p>
  <p>Thanks for signing in with Google. You now have a calm space for reflection and gentle planning.</p>
  <p>If you didn’t create this account, you can ignore this email.</p>
  <p style="color: #666; font-size: 14px;">— The Lumio team</p>
</body>
</html>`;

  const resendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: RESEND_FROM,
      to: [to],
      subject: 'Welcome to Lumio',
      html,
    }),
  });

  if (!resendRes.ok) {
    const t = await resendRes.text();
    console.error('Resend error:', resendRes.status, t);
    await supabase.from('welcome_email_log').delete().eq('clerk_user_id', userId);
    return new Response(JSON.stringify({ error: 'Email send failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ received: true, sent: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
