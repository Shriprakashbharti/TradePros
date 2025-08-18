import { useEffect, useState } from 'react'
import api from '../lib/api'

export default function Orders() {
  const [orders, setOrders] = useState([])
  async function load() { const { data } = await api.get('/api/orders'); setOrders(data) }
  useEffect(() => { load() }, [])
  return (
    <div className="border rounded p-3 bg-white">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold">Orders</div>
        <button className="border rounded px-2 py-1" onClick={load}>Refresh</button>
      </div>
      <table className="w-full text-sm">
        <thead><tr><th>Time</th><th>Symbol</th><th>Side</th><th>Type</th><th>Price</th><th>Qty</th><th>Filled</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {orders.map((o)=>(
            <tr key={o._id}>
              <td>{new Date(o.createdAt).toLocaleTimeString()}</td>
              <td>{o.symbol}</td>
              <td>{o.side}</td>
              <td>{o.type}</td>
              <td>{o.price ?? '-'}</td>
              <td>{o.qty}</td>
              <td>{o.filledQty}</td>
              <td>{o.status}</td>
              <td>{(o.status==='OPEN'||o.status==='PARTIAL') && <button className="px-2 py-1 border rounded" onClick={async()=>{ await api.post(`/api/orders/${o._id}/cancel`); load() }}>Cancel</button>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}


