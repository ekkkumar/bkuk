import { isAdmin } from './_auth.js';
export async function onRequestPost({ request, env }) {
  if (!isAdmin(request, env)) return new Response('Unauthorized', { status: 401 });
  const body = await request.json();
  let { url, code } = body;
  if (!url) return new Response('Missing url', { status: 400 });
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  if (!code) code = Math.random().toString(36).slice(2,8);
  if (!/^[A-Za-z0-9-_]+$/.test(code)) return new Response('Invalid code', { status: 400 });
  const exists = await env.LINKS.get(code);
  if (exists) return new Response('Exists', { status: 409 });
  await env.LINKS.put(code, url);
  await env.LINKS.put('COUNT:' + code, '0');
  return new Response(JSON.stringify({ code, url }), { headers: { 'Content-Type': 'application/json' }});
}
