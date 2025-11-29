import { isAdmin } from './_auth.js';
export async function onRequestGet({ request, env }) {
  if (!isAdmin(request, env)) return new Response('Unauthorized', { status: 401 });
  const list = await env.LINKS.list();
  const arr = [];
  for (const k of list.keys) {
    if (k.name.startsWith('COUNT:') || k.name.startsWith('HIST:')) continue;
    const c = parseInt(await env.LINKS.get('COUNT:' + k.name) || '0',10);
    arr.push({ code: k.name, url: await env.LINKS.get(k.name), clicks: c });
  }
  arr.sort((a,b)=>b.clicks-a.clicks);
  return new Response(JSON.stringify(arr.slice(0,50)), { headers: { 'Content-Type': 'application/json' }});
}
