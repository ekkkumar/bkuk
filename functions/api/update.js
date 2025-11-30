import { isAdmin } from './_auth.js';
export async function onRequestPost({ request, env }) {
  if (!isAdmin(request, env)) return new Response('Unauthorized', { status: 401 });
  let code, url;
  try {
    ({ code, url } = await request.json());
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }
  if (!code || !url) return new Response('Missing code or url', { status: 400 });
  if (!/^[A-Za-z0-9-_]+$/.test(code)) return new Response('Invalid code', { status: 400 });
  if (!url.includes('://')) {
    url = 'https://' + url;
  } else if (!/^https?:\/\//i.test(url)) {
    return new Response('Invalid URL protocol', { status: 400 });
  }
  const exists = await env.LINKS.get(code);
  if (!exists) return new Response('Not found', { status: 404 });
  await env.LINKS.put(code, url);
  return new Response('OK');
}
