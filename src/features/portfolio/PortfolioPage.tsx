import { useQuery } from '@tanstack/react-query';
import { getPortfolio } from '../../api/trading';
import { Spinner } from '../../components/Spinner';
import { ApiError } from '../../api/client';
import { friendlyError } from '../../api/errorMessages';

export function PortfolioPage() {
  const { data, error, isLoading } = useQuery({
    queryKey: ['portfolio'],
    queryFn: getPortfolio,
  });

  const card = 'bg-neutral-900/80 border border-red-900/30 rounded-none shadow-lg shadow-red-950/40';

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h2 className="text-lg font-semibold mb-4">Portfolio</h2>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner className="h-8 w-8" />
        </div>
      )}

      {error && (
        <p className="text-red-300 text-sm bg-red-950/60 border border-red-900/40 rounded-none px-4 py-3 mb-4">
          {error instanceof ApiError
            ? friendlyError(error.code, error.message)
            : 'Could not load portfolio.'}
        </p>
      )}

      {data && (
        <>
          {/* summary cards */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className={`${card} p-5`}>
              <p className="text-neutral-400 text-xs mb-1">Cash Balance</p>
              <p className="text-xl font-semibold tabular-nums">
                ${data.fiatBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className={`${card} p-5`}>
              <p className="text-neutral-400 text-xs mb-1">Total Value (cash + crypto)</p>
              <p className="text-xl font-semibold tabular-nums">
                ${data.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* holdings */}
          <h3 className="text-sm font-semibold mb-2 text-neutral-300">Holdings</h3>
          {data.holdings.length === 0 ? (
            <p className={`${card} text-neutral-400 text-sm px-4 py-6 text-center mb-6`}>
              No crypto yet — buy something on the Market page.
            </p>
          ) : (
            <div className={`${card} divide-y divide-neutral-800 mb-6`}>
              {data.holdings.map((h) => (
                <div key={h.symbol} className="flex items-center justify-between px-5 py-3">
                  <span className="font-semibold">{h.symbol}</span>
                  <span className="text-sm text-neutral-400 tabular-nums">{h.quantity}</span>
                  <span className="tabular-nums">
                    ${h.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* recent transactions */}
          <h3 className="text-sm font-semibold mb-2 text-neutral-300">Recent Transactions</h3>
          {data.recentTransactions.length === 0 ? (
            <p className={`${card} text-neutral-400 text-sm px-4 py-6 text-center`}>
              No transactions yet.
            </p>
          ) : (
            <div className={`${card} divide-y divide-neutral-800`}>
              {data.recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between px-5 py-3 text-sm">
                  <span
                    className={`font-semibold ${tx.side === 'BUY' ? 'text-green-400' : 'text-red-400'}`}
                  >
                    {tx.side}
                  </span>
                  <span>{tx.symbol}</span>
                  <span className="tabular-nums text-neutral-400">{tx.quantity}</span>
                  <span className="tabular-nums">
                    ${tx.fiatAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-neutral-500 text-xs">
                    {new Date(tx.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}