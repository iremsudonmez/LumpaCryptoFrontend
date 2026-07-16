// auth shapes -> match elif's live swagger
export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  userId: string;
  email: string;
  username: string;
  walletBalance: number;
  expiresAt: string;
}

// standard backend error body
export interface ApiErrorBody {
  message: string;
  code: string;
  timestamp: string;
}

// market
export interface PriceQuote {
  symbol: string;
  price: number;
  quotedAt: string;
}

// trading
export type OrderSide = 'BUY' | 'SELL';

export interface OrderRequest {
  symbol: string;
  // buy -> fiat to spend, sell -> crypto quantity (api contract, decision #12)
  side: OrderSide;
  amount: number;
}

export interface OrderResponse {
  symbol: string;
  side: OrderSide;
  quantity: number;
  executionPrice: number;
  fiatAmount: number;
  fiatBalance: number;
  createdAt: string;
}

// portfolio
export interface HoldingDto {
  symbol: string;
  quantity: number;
  price: number;
  value: number;
}

export interface TransactionDto {
  id: string;
  symbol: string;
  side: OrderSide;
  quantity: number;
  executionPrice: number;
  fiatAmount: number;
  createdAt: string;
}

export interface PortfolioDto {
  fiatBalance: number;
  holdings: HoldingDto[];
  totalValue: number;
  recentTransactions: TransactionDto[];
}