import { request } from './client';
import { mockApi } from './mock';
import type { OrderRequest, OrderResponse, PortfolioDto } from './types';

const USE_MOCK = import.meta.env.VITE_API_MODE !== 'real';

export async function getPortfolio(): Promise<PortfolioDto> {
  return USE_MOCK ? mockApi.getPortfolio() : request<PortfolioDto>('/api/v1/portfolio');
}

export async function executeOrder(order: OrderRequest): Promise<OrderResponse> {
  return USE_MOCK
    ? mockApi.executeOrder(order)
    : request<OrderResponse>('/api/v1/orders', { method: 'POST', body: order });
}