import { isAdmin } from './_auth.js';
export async function onRequestPost({ request, env }) {
  if (!isAdmin(request, env)) return new Response('Unauthorized', { status: 401 });
  const { code } = await request.json();
  if (!code) return new Response('Missing', { status: 400 });
  await env.LINKS.delete(code);
  await env.LINKS.delete('COUNT:' + code);
  const list = await env.LINKS.list({ prefix: 'HIST:' + code + ':' });
  for (const k of list.keys) { await env.LINKS.delete(k.name); }
  return new Response('OK');
}
