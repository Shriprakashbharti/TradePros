import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'

export default function RecentTrades({ symbol }) {
  const [trades, setTrades] = useState([])
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    const base = import.meta.env.VITE_WS_BASE || 'ws://localhost:5000'
    const socket = io(base + '/ws', { auth: { token } })
    socket.emit('market:subscribe', { symbol })
    const handler = (trade) => { if (trade.symbol === symbol) setTrades((t) => [trade, ...t].slice(0, 20)) }
    socket.on('trades:updated', handler)
    return () => socket.disconnect()
  }, [symbol])
  return (
    <div className="border rounded p-3 bg-white">
      <div className="font-semibold mb-2">Recent Trades</div>
      <table className="w-full text-sm">
        <thead><tr><th>Time</th><th>Side</th><th>Price</th><th>Qty</th></tr></thead>
        <tbody>
          {trades.map((t, idx)=>(
            <tr key={idx}><td>{new Date(t.createdAt).toLocaleTimeString()}</td><td>{t.side}</td><td>{t.price}</td><td>{t.qty}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}


