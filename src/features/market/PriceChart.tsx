import { useQuery } from '@tanstack/react-query';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import { getPriceHistory } from '../../api/market';
import { Spinner } from '../../components/Spinner';

interface Props {
  symbol: string;
}

export function PriceChart({ symbol }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ['history', symbol],
    queryFn: () => getPriceHistory(symbol),
    refetchInterval: 15_000, // chart grows a point every tick
  });

  if (isLoading)
    return (
      <div className="flex justify-center py-10">
        <Spinner className="h-6 w-6" />
      </div>
    );

  if (!data || data.length < 2)
    return (
      <p className="text-neutral-500 text-xs text-center py-8">
        Not enough history yet — the chart fills up as prices tick every 15s.
      </p>
    );

  const points = data.map((q) => ({
    time: new Date(q.quotedAt).toLocaleTimeString('en-US', {
      hour12: false, hour: '2-digit', minute: '2-digit',
    }),
    price: q.price,
  }));

  const rising = points[points.length - 1].price >= points[0].price;
  const color = rising ? '#4ade80' : '#f87171'; // green-400 / red-400

  // recharts may pass undefined -> normalize before formatting
  const formatPrice = (v: unknown) => {
    const n = typeof v === 'number' ? v : Number(v);
    return Number.isFinite(n)
      ? `$${n.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
      : '';
  };

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={`fill-${symbol}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#262626" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="time" stroke="#525252" fontSize={10} tickLine={false} minTickGap={40} />
          <YAxis
            stroke="#525252" fontSize={10} tickLine={false} width={70}
            domain={['auto', 'auto']}
            tickFormatter={(v) => formatPrice(v)}
          />
          <Tooltip
            contentStyle={{
              background: '#171717', border: '1px solid #7f1d1d',
              borderRadius: 0, fontSize: 12,
            }}
            labelStyle={{ color: '#a3a3a3' }}
            formatter={(v) => [formatPrice(v), 'Price']}
          />
          <Area
            type="monotone" dataKey="price" stroke={color} strokeWidth={2}
            fill={`url(#fill-${symbol})`} isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}