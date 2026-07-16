import type { AuthResponse } from './types';
import { ApiError } from './client';

// fake network latency -> loading spinners become visible and testable
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// in-memory fake user store -> resets on page refresh, fine for ui work
const users: { email: string; username: string; password: string }[] = [];

function buildAuthResponse(email: string, username: string): AuthResponse {
  return {
    token: 'mock-token-' + crypto.randomUUID(),
    userId: crypto.randomUUID(),
    email,
    username,
    // randomized starting balance -> mirrors backend rule ($10k-$100k)
    walletBalance: Math.round((10_000 + Math.random() * 90_000) * 100) / 100,
    expiresAt: new Date(Date.now() + 3600_000).toISOString(),
  };
}

export const mockApi = {
  async register(email: string, username: string, password: string): Promise<AuthResponse> {
    await delay(700);
    if (users.some((u) => u.email === email))
      throw new ApiError(409, 'EMAIL_TAKEN', 'Email already registered');
    users.push({ email, username, password });
    return buildAuthResponse(email, username);
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    await delay(500);
    const user = users.find((u) => u.email === email && u.password === password);
    // allow a demo login even with no registered users -> demo@lumpa.dev / password
    if (!user && !(email === 'demo@lumpa.dev' && password === 'password'))
      throw new ApiError(401, 'INVALID_CREDENTIALS', 'Wrong email or password');
    return buildAuthResponse(email, user?.username ?? 'demouser');
  },

  async logout(): Promise<void> {
    await delay(200);
  },
};