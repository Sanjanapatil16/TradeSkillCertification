const TOKEN_KEY = 'tradecert_token';
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => (t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY));

async function req(method, url, body) {
  const headers = { 'Content-Type': 'application/json' };
  const t = getToken();
  if (t) headers['Authorization'] = 'Bearer ' + t;
  const res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed (' + res.status + ')');
  return data;
}

export const api = {
  register: (b) => req('POST', '/api/register', b),
  login: (b) => req('POST', '/api/login', b),
  me: () => req('GET', '/api/me'),
  myCertificates: () => req('GET', '/api/certificates/mine'),
  issueCertificate: (b) => req('POST', '/api/certificates', b),
  revokeCertificate: (id) => req('POST', `/api/certificates/${id}/revoke`),
  verify: (id) => req('GET', `/api/verify/${id}`),
  institutes: () => req('GET', '/api/institutes'),
  approveInstitute: (id) => req('POST', `/api/institutes/${id}/approve`),
  rejectInstitute: (id) => req('POST', `/api/institutes/${id}/reject`),
  adminOverview: () => req('GET', '/api/admin/overview')
};
