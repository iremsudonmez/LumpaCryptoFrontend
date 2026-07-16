import { useState, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPortfolio, executeOrder } from '../../api/trading';
import { Spinner } from '../../components/Spinner';
import { ApiError } from '../../api/client';
import { friendlyError } from '../../api/errorMessages';
import type { OrderSide, PriceQuote } from '../../api/types';

interface Props {
  quote: PriceQuote;      // the coin that was clicked
  onClose: () => void;    // parent closes the modal
}

export function TradeModal({ quote, onClose }: Props) {
  const queryClient = useQueryClient();

  const [side, setSide] = useState<OrderSide>('BUY');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // portfolio decides which buttons make sense
  const { data: portfolio } = useQuery({
    queryKey: ['portfolio'],
    queryFn: getPortfolio,
  });

  const holding = portfolio?.holdings.find((h) => h.symbol === quote.symbol);
  const canBuy = (portfolio?.fiatBalance ?? 0) > 0;
  const canSell = (holding?.quantity ?? 0) > 0;

  const numericAmount = Number(amount);
  const validAmount = amount !== '' && numericAmount > 0;

  // live preview -> buy: $ to coins, sell: coins to $
  const preview =
    validAmount &&
    (side === 'BUY'
      ? `≈ ${(numericAmount / quote.price).toFixed(8)} ${quote.symbol}`
      : `≈ $${(numericAmount * quote.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}`);

  const mutation = useMutation({
    mutationFn: executeOrder,
    onSuccess: (res) => {
      setSuccess(
        `${res.side === 'BUY' ? 'Bought' : 'Sold'} ${res.quantity} ${res.symbol} for $${res.fiatAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      );
      setError(null);
      setAmount('');
      // refetch portfolio so balances update everywhere
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    },
    onError: (err) => {
      setSuccess(null);
      if (err instanceof ApiError) setError(friendlyError(err.code, err.message));
      else setError('Unexpected error, please try again.');
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validAmount) {
      setError('Please enter a valid positive amount.');
      return;
    }
    setError(null);
    mutation.mutate({ symbol: quote.symbol, side, amount: numericAmount });
  };

  return (
    // dark backdrop -> clicking it closes the modal
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center px-4 z-50"
      onClick={onClose}
    >
      {/* stopPropagation -> clicks inside the card must not close it */}
      <div
        className="w-full max-w-md bg-neutral-900 border border-red-900/40 rounded-none p-6 shadow-xl shadow-red-950/50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-xl font-bold text-white uppercase">{quote.symbol}</h3>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
        </div>
        <p className="text-neutral-400 text-sm mb-4 tabular-nums">
          Current price: ${quote.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>

        {portfolio && (
          <p className="text-neutral-400 text-xs mb-4">
            Balance: ${portfolio.fiatBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            {holding && ` · You own ${holding.quantity} ${quote.symbol}`}
          </p>
        )}

        {/* side switch -> only valid options are enabled */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            type="button"
            disabled={!canBuy}
            onClick={() => setSide('BUY')}
            className={`rounded-none py-2 font-medium transition disabled:opacity-40 ${
              side === 'BUY'
                ? 'bg-red-700 text-white shadow-md shadow-red-950/50'
                : 'bg-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            Buy
          </button>
          <button
            type="button"
            disabled={!canSell}
            onClick={() => setSide('SELL')}
            className={`rounded-none py-2 font-medium transition disabled:opacity-40 ${
              side === 'SELL'
                ? 'bg-red-700 text-white shadow-md shadow-red-950/50'
                : 'bg-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            Sell
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="number"
              step="any"
              min="0"
              placeholder={side === 'BUY' ? 'USD amount to spend' : `${quote.symbol} quantity to sell`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-none bg-neutral-800 text-white placeholder-neutral-500 px-4 py-2.5 outline-none border border-transparent focus:border-red-700 transition"
            />
            {preview && <p className="text-neutral-400 text-xs mt-1 tabular-nums">{preview}</p>}
          </div>

          {error && (
            <p className="text-red-300 text-sm bg-red-950/60 border border-red-900/40 rounded-none px-3 py-2">
              {error}
            </p>
          )}
          {success && (
            <p className="text-green-300 text-sm bg-green-950/60 border border-green-900/40 rounded-none px-3 py-2">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full rounded-none bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white font-medium py-2.5 transition shadow-md shadow-red-950/50"
          >
            {mutation.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner />
                Executing...
              </span>
            ) : (
              'Execute Order'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}