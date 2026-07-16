import { useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPrices } from '../../api/market';
import { useAuth } from '../../state/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Spinner } from '../../components/Spinner';
import { ApiError } from '../../api/client';
import { friendlyError } from '../../api/errorMessages';

// direction of the latest price move per symbol
type Direction = 'up' | 'down' | 'same';

export function MarketPage() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const { data, error, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['prices'],
    queryFn: getPrices,
    refetchInterval: 15_000,
  });

  // previous prices live in a ref -> survives re-renders without causing them
  const prevPrices = useRef<Record<string, number>>({});
  const directions = useRef<Record<string, Direction>>({});

  useEffect(() => {
    if (!data) return;
    for (const q of data) {
      const prev = prevPrices.current[q.symbol];
      if (prev === undefined) directions.current[q.symbol] = 'same';
      else if (q.price > prev) directions.current[q.symbol] = 'up';
      else if (q.price < prev) directions.current[q.symbol] = 'down';
      else directions.current[q.symbol] = 'same';
      prevPrices.current[q.symbol] = q.price;
    }
  }, [data]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-red-950 text-white">
      <header className="flex items-center justify-between px-6 py-4 bg-black">
        <h1 className="text-xl font-bold uppercase tracking-wide">LumpaCrypto</h1>
        <div className="flex items-center gap-4">
          {user && <span className="text-sm text-red-300">{user.username}</span>}
          <button
            onClick={handleLogout}
            className="rounded-none bg-red-600 hover:bg-red-500 px-4 py-1.5 text-sm font-medium transition"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Market</h2>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 rounded-none bg-red-600 hover:bg-red-500 disabled:opacity-50 px-4 py-1.5 text-sm font-medium transition"
          >
            {isFetching ? <Spinner /> : null}
            Refresh
          </button>
        </div>

        {isLoading && (
          <div className="flex justify-center py-16">
            <Spinner className="h-8 w-8" />
          </div>
        )}

        {error && (
          <p className="text-white text-sm bg-red-900 rounded-none px-4 py-3 mb-4">
            {error instanceof ApiError
              ? friendlyError(error.code, error.message)
              : 'Could not load prices.'}
          </p>
        )}

        {data && (
          <div className="bg-black rounded-none divide-y divide-red-950">
            {data.map((quote) => {
              const dir = directions.current[quote.symbol] ?? 'same';
              return (
                <div
                  key={quote.symbol}
                  className="flex items-center justify-between px-5 py-4 hover:bg-neutral-900 cursor-pointer transition"
                >
                  <span className="font-semibold">{quote.symbol}</span>
                  <span
                    className={`tabular-nums flex items-center gap-2 ${
                      dir === 'up'
                        ? 'text-green-400'
                        : dir === 'down'
                          ? 'text-red-400'
                          : 'text-white'
                    }`}
                  >
                    {dir === 'up' && <span>▲</span>}
                    {dir === 'down' && <span>▼</span>}
                    ${quote.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}