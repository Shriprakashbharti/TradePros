import { useEffect, useState } from 'react'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ResponsiveContainer, 
  ReferenceLine,
  Area,
  AreaChart,
  Brush
} from 'recharts'
import { useMarket } from '../store/market'
import { format } from 'date-fns'

export default function PriceChart({ symbol }) {
  const { candles, loadCandles, tick } = useMarket()
  const [timeframe, setTimeframe] = useState('1m')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        await loadCandles(symbol, timeframe)
      } catch (err) {
        setError(`Failed to load chart data: ${err.message}`)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [symbol, timeframe, loadCandles])

  const formatChartData = () => {
    return candles.map(c => ({
      time: c.ts,
      open: c.o,
      high: c.h,
      low: c.l,
      close: c.c,
      volume: c.v,
      date: format(new Date(c.ts), 'HH:mm')
    }))
  }

  const data = formatChartData()
  const latestPrice = tick?.symbol === symbol ? tick.last : null
  const lastClose = data.length > 0 ? data[data.length - 1].close : null
  const priceChange = latestPrice && lastClose ? ((latestPrice - lastClose) / lastClose * 100) : 0

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-sm">
          <p className="font-semibold">{format(new Date(data.time), 'PPpp')}</p>
          <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
            <div>Open:</div><div className="text-right">{data.open.toFixed(2)}</div>
            <div>High:</div><div className="text-right">{data.high.toFixed(2)}</div>
            <div>Low:</div><div className="text-right">{data.low.toFixed(2)}</div>
            <div>Close:</div><div className="text-right font-medium">{data.close.toFixed(2)}</div>
            <div>Volume:</div><div className="text-right">{data.volume.toLocaleString()}</div>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        <div>
          <h3 className="font-semibold text-gray-800">{symbol}</h3>
          {latestPrice && (
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xl font-bold">₹{latestPrice.toFixed(2)}</span>
              <span className={`text-sm ${priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {priceChange >= 0 ? '↑' : '↓'} {Math.abs(priceChange).toFixed(2)}%
              </span>
            </div>
          )}
        </div>
        <div className="flex space-x-2">
          {['1m', '5m', '15m', '1h', '1d'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 text-xs rounded-md ${
                timeframe === tf 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="p-1">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickMargin={10}
              />
              <YAxis 
                domain={['auto', 'auto']}
                orientation="right"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => value.toFixed(2)}
                tickMargin={10}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="close"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorValue)"
                strokeWidth={2}
              />
              {latestPrice && (
                <ReferenceLine 
                  y={latestPrice} 
                  stroke={priceChange >= 0 ? '#10b981' : '#ef4444'} 
                  strokeDasharray="3 3"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
          
          <div className="mt-1 h-20">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" hide />
                <YAxis hide domain={['auto', 'auto']} />
                <Area
                  type="monotone"
                  dataKey="close"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
                <Brush 
                  dataKey="date"
                  height={20}
                  stroke="#8884d8"
                  travellerWidth={8}
                  fill="#f8fafc"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}