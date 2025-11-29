import { isAdmin } from './_auth.js';
export async function onRequestGet({ request, env }) {
  if (!isAdmin(request, env)) return new Response('Unauthorized', { status: 401 });
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  if (!code) return new Response(JSON.stringify({ error: 'missing' }), { status: 400 });
  const c = await env.LINKS.get('COUNT:' + code);
  const out = { code, count: parseInt(c || '0', 10), labels: [], data: [] };
  const now = new Date();
  for (let i=29;i>=0;i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const y = d.getFullYear(), m = String(d.getMonth()+1).padStart(2,'0'), day=String(d.getDate()).padStart(2,'0');
    const key = 'HIST:' + code + ':' + y + '-' + m + '-' + day;
    const v = await env.LINKS.get(key) || '0';
    out.labels.push(y + '-' + m + '-' + day);
    out.data.push(parseInt(v,10));
  }
  return new Response(JSON.stringify(out), { headers: { 'Content-Type': 'application/json' }});
}
