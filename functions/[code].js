export async function onRequestGet({ request, env, params }) {
  const code = params.code;
  if (!code) return env.ASSETS.fetch(request);
  const raw = await env.LINKS.get(code);
  if (!raw) return env.ASSETS.fetch(request);
  let dest = raw;
  let devices = null;
  try { const parsed = JSON.parse(raw); if (parsed && parsed.url) { dest = parsed.url; devices = parsed.devices || null; } } catch(e){}
  const ua = request.headers.get('User-Agent') || '';
  const isMobile = /Android|iPhone|iPod|IEMobile|Opera Mini/i.test(ua);
  const isTablet = /iPad|Tablet|Nexus 7|Nexus 10/i.test(ua);
  if (devices) {
    if (isMobile && devices.mobile) return Response.redirect(devices.mobile, 302);
    if (isTablet && devices.tablet) return Response.redirect(devices.tablet, 302);
    if (devices.desktop) return Response.redirect(devices.desktop, 302);
  }
  try {
    const key = 'COUNT:' + code;
    const cur = await env.LINKS.get(key);
    const n = parseInt(cur || '0',10) + 1;
    await env.LINKS.put(key, String(n));
    const now = new Date();
    const y = now.getFullYear(), m = String(now.getMonth()+1).padStart(2,'0'), d = String(now.getDate()).padStart(2,'0');
    const hkey = 'HIST:' + code + ':' + y + '-' + m + '-' + d;
    const curh = await env.LINKS.get(hkey) || '0';
    await env.LINKS.put(hkey, String(parseInt(curh||'0',10)+1));
  } catch(e){}
  return Response.redirect(dest, 302);
}
