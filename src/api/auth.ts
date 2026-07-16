import { request, setToken } from './client';
import { mockApi } from './mock';
import type { AuthResponse, LoginRequest, RegisterRequest } from './types';

const USE_MOCK = import.meta.env.VITE_API_MODE !== 'real';

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const res = USE_MOCK
    ? await mockApi.register(data.email, data.username, data.password)
    : await request<AuthResponse>('/api/v1/auth/register', {
        method: 'POST', body: data, auth: false,
      });
  setToken(res.token);
  return res;
}

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const res = USE_MOCK
    ? await mockApi.login(data.email, data.password)
    : await request<AuthResponse>('/api/v1/auth/login', {
        method: 'POST', body: data, auth: false,
      });
  setToken(res.token);
  return res;
}

export async function logout(): Promise<void> {
  if (USE_MOCK) await mockApi.logout();
  else await request<void>('/api/v1/auth/logout', { method: 'POST' });
  setToken(null);
}