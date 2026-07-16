import type { AuthResponse, PriceQuote } from './types';
import { ApiError } from './client';

// fake network latency -> loading spinners become visible and testable
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// in-memory fake user store -> resets on page refresh, fine for ui work
const users: { email: string; username: string; password: string }[] = [];

// fake price store -> BTC, ETH, SOL, XRP as decided by the team
const prices: Record<string, number> = {
  BTC: 65000.5,
  ETH: 3200.75,
  SOL: 145.3,
  XRP: 0.52,
};

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
    await delay(1500);
    const user = users.find((u) => u.email === email && u.password === password);
    // allow a demo login even with no registered users -> demo@lumpa.dev / password
    if (!user && !(email === 'demo@lumpa.dev' && password === 'password'))
      throw new ApiError(401, 'INVALID_CREDENTIALS', 'Wrong email or password');
    return buildAuthResponse(email, user?.username ?? 'demouser');
  },

  async logout(): Promise<void> {
    await delay(200);
  },

  async getPrices(): Promise<PriceQuote[]> {
    await delay(300);
    // drift each price a little on every call -> polling looks alive
    for (const s of Object.keys(prices)) {
      const factor = 1 + (Math.random() - 0.5) * 0.01;
      prices[s] = Math.round(prices[s] * factor * 100) / 100;
    }
    const now = new Date().toISOString();
    return Object.entries(prices).map(([symbol, price]) => ({
      symbol,
      price,
      quotedAt: now,
    }));
  },
};