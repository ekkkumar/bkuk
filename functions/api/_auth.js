export function isAdmin(request, env) {
  const token = request.headers.get('x-admin-token') || '';
  if (token && token === env.ADMIN_TOKEN) return true;
  const cookie = request.headers.get('Cookie') || '';
  if (cookie.includes('admin=1')) return true;
  return false;
}
