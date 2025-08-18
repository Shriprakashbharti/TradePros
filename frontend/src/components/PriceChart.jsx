import { useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts'
import { useMarket } from '../store/market'

export default function PriceChart({ symbol }) {
  const { candles, loadCandles, tick } = useMarket()
  useEffect(() => { loadCandles(symbol) }, [symbol])
  const data = candles.map(c => ({ time: new Date(c.ts).toLocaleTimeString(), price: c.c }))
  if (tick && tick.symbol === symbol && data.length) {
    data[data.length - 1] = { ...data[data.length - 1], price: tick.last }
  }
  return (
    <div className="border rounded p-3 bg-white">
      <div className="font-semibold mb-2">{symbol} Price</div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" hide />
          <YAxis domain={['auto', 'auto']} />
          <Tooltip />
          <Line type="monotone" dataKey="price" stroke="#3b82f6" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}


