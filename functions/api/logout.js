export async function onRequestPost() {
  return new Response('OK', { headers: { 'Set-Cookie': 'admin=; HttpOnly; Secure; Path=/; Max-Age=0' }});
}
