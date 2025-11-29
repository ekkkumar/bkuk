import { isAdmin } from './_auth.js';
export async function onRequestPost({ request, env }) {
  if (!isAdmin(request, env)) return new Response('Unauthorized', { status: 401 });
  const body = await request.json();
  const { code, devices } = body;
  if (!code) return new Response('Missing code', { status: 400 });
  const existing = await env.LINKS.get(code);
  if (!existing) return new Response('Not found', { status: 404 });
  const record = { url: existing, devices: devices || {} };
  await env.LINKS.put(code, JSON.stringify(record));
  return new Response('OK');
}
