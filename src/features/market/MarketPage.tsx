import { useRef, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPrices } from '../../api/market';
import { Spinner } from '../../components/Spinner';
import { ApiError } from '../../api/client';
import { friendlyError } from '../../api/errorMessages';
import { TradeModal } from '../trading/TradeModal';
import type { PriceQuote } from '../../api/types';

// direction of the latest price move per symbol
type Direction = 'up' | 'down' | 'same';

export function MarketPage() {
  const [selected, setSelected] = useState<PriceQuote | null>(null);

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

  return (
    <>
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Market</h2>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 rounded-none bg-red-700 hover:bg-red-600 disabled:opacity-50 px-4 py-1.5 text-sm font-medium transition shadow-md shadow-red-950/50"
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
          <p className="text-red-300 text-sm bg-red-950/60 border border-red-900/40 rounded-none px-4 py-3 mb-4">
            {error instanceof ApiError
              ? friendlyError(error.code, error.message)
              : 'Could not load prices.'}
          </p>
        )}

        {data && (
          <div className="bg-neutral-900/80 border border-red-900/30 rounded-none divide-y divide-neutral-800 shadow-lg shadow-red-950/40">
            {data.map((quote) => {
              const dir = directions.current[quote.symbol] ?? 'same';
              // key includes price -> react remounts the row on change, replaying the flash
              const flashClass =
                dir === 'up' ? 'flash-up' : dir === 'down' ? 'flash-down' : '';
              return (
                <div
                  key={`${quote.symbol}-${quote.price}`}
                  onClick={() => setSelected(quote)}
                  className={`flex items-center justify-between px-5 py-4 hover:bg-neutral-800/70 cursor-pointer transition ${flashClass}`}
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

      {selected && <TradeModal quote={selected} onClose={() => setSelected(null)} />}
    </>
  );
}