export async function onRequestPost({ request, env }) {
  const passwd = (await request.text()).trim();
  if (!passwd || passwd !== env.ADMIN_PASSWORD) {
    return new Response('Unauthorized', { status: 401 });
  }
  const headers = { 'Set-Cookie': `admin=1; HttpOnly; Secure; Path=/; Max-Age=3600` };
  return new Response('OK', { status: 200, headers });
}
