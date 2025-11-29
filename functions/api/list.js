import { isAdmin } from './_auth.js';
export async function onRequestGet({ env, request }) {
  if (!isAdmin(request, env)) return new Response('Unauthorized', { status: 401 });
  const items = {};
  const list = await env.LINKS.list();
  for (const k of list.keys) {
    if (k.name.startsWith('COUNT:') || k.name.startsWith('HIST:')) continue;
    const v = await env.LINKS.get(k.name);
    items[k.name] = v;
  }
  return new Response(JSON.stringify(items), { headers: { 'Content-Type': 'application/json' }});
}
