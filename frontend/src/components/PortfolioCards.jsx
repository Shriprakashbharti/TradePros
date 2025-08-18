import { useEffect, useState } from 'react'
import api from '../lib/api'

export default function PortfolioCards() {
  const [summary, setSummary] = useState({ totalUnrealized: 0, totalRealized: 0, positionsCount: 0 })
  const [positions, setPositions] = useState([])
  useEffect(() => {
    (async () => {
      const { data: s } = await api.get('/api/portfolio/summary')
      setSummary(s)
      const { data: p } = await api.get('/api/portfolio/positions')
      setPositions(p)
    })()
  }, [])
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="p-3 border rounded bg-white">Unrealized: {summary.totalUnrealized.toFixed(2)}</div>
      <div className="p-3 border rounded bg-white">Realized: {summary.totalRealized.toFixed(2)}</div>
      <div className="p-3 border rounded bg-white">Positions: {summary.positionsCount}</div>
      <div className="col-span-3 p-3 border rounded bg-white">
        <div className="font-semibold mb-2">Positions</div>
        <table className="w-full text-sm">
          <thead><tr><th>Symbol</th><th>Qty</th><th>Avg Price</th><th>Unrealized</th><th>Realized</th></tr></thead>
          <tbody>
            {positions.map((p) => (
              <tr key={p._id}><td>{p.symbol}</td><td>{p.qty}</td><td>{p.avgPrice}</td><td>{p.unrealizedPnL}</td><td>{p.realizedPnL}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}


