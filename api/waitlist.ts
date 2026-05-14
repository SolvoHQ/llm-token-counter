export const config = { runtime: 'edge' };

export default async function handler(req: Request): Promise<Response> {
  const cors = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: cors });
  }

  let email: string;
  try {
    const body = await req.json();
    email = body?.email ?? '';
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: cors });
  }

  if (!email || !email.includes('@')) {
    return new Response(JSON.stringify({ error: 'Invalid email' }), { status: 400, headers: cors });
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'LLM Token Counter <noreply@west0n.top>',
      to: 'west0n@west0n.top',
      subject: 'New API waitlist signup',
      html: `<p>New waitlist signup: <strong>${email}</strong></p>`,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    return new Response(JSON.stringify({ error: text }), { status: 502, headers: cors });
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: cors });
}
