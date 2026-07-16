import type {
  AuthResponse,
  PriceQuote,
  PortfolioDto,
  OrderRequest,
  OrderResponse,
  TransactionDto,
} from './types';
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

// fake wallet -> starts with fiat only, holdings grow as you trade
const wallet = {
  fiatBalance: 42350.0,
  holdings: [] as { symbol: string; quantity: number }[],
  transactions: [] as TransactionDto[],
};

function buildAuthResponse(email: string, username: string): AuthResponse {
  return {
    token: 'mock-token-' + crypto.randomUUID(),
    userId: crypto.randomUUID(),
    email,
    username,
    walletBalance: wallet.fiatBalance,
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

  async getPortfolio(): Promise<PortfolioDto> {
    await delay(400);
    const holdings = wallet.holdings.map((h) => ({
      ...h,
      price: prices[h.symbol],
      value: Math.round(h.quantity * prices[h.symbol] * 100) / 100,
    }));
    const totalValue =
      Math.round(
        (wallet.fiatBalance + holdings.reduce((s, h) => s + h.value, 0)) * 100,
      ) / 100;
    return {
      fiatBalance: wallet.fiatBalance,
      holdings,
      totalValue,
      recentTransactions: wallet.transactions.slice(0, 5),
    };
  },

  async executeOrder(req: OrderRequest): Promise<OrderResponse> {
    await delay(600);
    const price = prices[req.symbol];
    if (!price) throw new ApiError(400, 'UNSUPPORTED_SYMBOL', 'Unsupported symbol');
    if (!(req.amount > 0))
      throw new ApiError(400, 'VALIDATION_ERROR', 'Amount must be positive');

    let quantity: number;
    let fiatAmount: number;

    if (req.side === 'BUY') {
      // buy -> amount is fiat to spend, quantity rounded DOWN to 8dp
      if (req.amount > wallet.fiatBalance)
        throw new ApiError(422, 'INSUFFICIENT_FUNDS', 'Insufficient funds');
      fiatAmount = req.amount;
      quantity = Math.floor((req.amount / price) * 1e8) / 1e8;
      wallet.fiatBalance = Math.round((wallet.fiatBalance - fiatAmount) * 100) / 100;
      const h = wallet.holdings.find((x) => x.symbol === req.symbol);
      if (h) h.quantity = Math.round((h.quantity + quantity) * 1e8) / 1e8;
      else wallet.holdings.push({ symbol: req.symbol, quantity });
    } else {
      // sell -> amount is crypto quantity to sell
      const h = wallet.holdings.find((x) => x.symbol === req.symbol);
      if (!h || h.quantity < req.amount)
        throw new ApiError(422, 'INSUFFICIENT_HOLDINGS', 'Not enough holdings');
      quantity = req.amount;
      fiatAmount = Math.round(quantity * price * 100) / 100;
      h.quantity = Math.round((h.quantity - quantity) * 1e8) / 1e8;
      if (h.quantity === 0)
        wallet.holdings = wallet.holdings.filter((x) => x.symbol !== req.symbol);
      wallet.fiatBalance = Math.round((wallet.fiatBalance + fiatAmount) * 100) / 100;
    }

    const tx: TransactionDto = {
      id: crypto.randomUUID(),
      symbol: req.symbol,
      side: req.side,
      quantity,
      executionPrice: price,
      fiatAmount,
      createdAt: new Date().toISOString(),
    };
    wallet.transactions.unshift(tx);

    return { ...tx, fiatBalance: wallet.fiatBalance };
  },
};