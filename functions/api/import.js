import { isAdmin } from './_auth.js';
export async function onRequestPost({ request, env }) {
  if (!isAdmin(request, env)) return new Response('Unauthorized', { status: 401 });
  const data = await request.json();
  if (!data || typeof data !== 'object') return new Response('Bad JSON', { status: 400 });
  const ops = [];
  for (const [k, v] of Object.entries(data)) {
    ops.push(env.LINKS.put(k, v));
    ops.push(env.LINKS.put('COUNT:' + k, '0'));
  }
  await Promise.all(ops);
  return new Response('OK');
}
