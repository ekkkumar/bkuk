import { isAdmin } from './_auth.js';
export async function onRequestPost({ request, env }) {
  if (!isAdmin(request, env)) return new Response('Unauthorized', { status: 401 });
  const { code, url } = await request.json();
  if (!code || !url) return new Response('Missing', { status: 400});
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  const exists = await env.LINKS.get(code);
  if (!exists) return new Response('Not found', { status: 404 });
  await env.LINKS.put(code, url);
  return new Response('OK');
}
