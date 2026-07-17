import { request } from './client';
import { mockApi } from './mock';
import type { PriceQuote } from './types';

const USE_MOCK = import.meta.env.VITE_API_MODE !== 'real';

export async function getPrices(): Promise<PriceQuote[]> {
  return USE_MOCK
    ? mockApi.getPrices()
    : request<PriceQuote[]>('/api/v1/market/prices', { auth: false });
}

export async function getPriceHistory(symbol: string): Promise<PriceQuote[]> {
  return USE_MOCK
    ? mockApi.getPriceHistory(symbol)
    : request<PriceQuote[]>(`/api/v1/market/prices/${symbol}/history`, { auth: false });
}