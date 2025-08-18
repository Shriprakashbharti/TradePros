import { useState } from 'react'
import api from '../lib/api'
import { useMarket } from '../store/market'

export default function OrderTicket() {
  const { instruments, symbol } = useMarket()
  const [form, setForm] = useState({ symbol, side: 'BUY', type: 'MARKET', price: '', qty: 1 })
  return (
    <div className="p-3 border rounded bg-white">
      <div className="font-semibold mb-2">Order Ticket</div>
      <div className="grid grid-cols-2 gap-2">
        <select className="border p-2 rounded col-span-2" value={form.symbol} onChange={(e)=>setForm({...form, symbol: e.target.value})}>
          {instruments.map((i)=> <option key={i.symbol} value={i.symbol}>{i.symbol}</option>)}
        </select>
        <select className="border p-2 rounded" value={form.side} onChange={(e)=>setForm({...form, side: e.target.value})}>
          <option>BUY</option>
          <option>SELL</option>
        </select>
        <select className="border p-2 rounded" value={form.type} onChange={(e)=>setForm({...form, type: e.target.value})}>
          <option>MARKET</option>
          <option>LIMIT</option>
        </select>
        {form.type === 'LIMIT' && (
          <input placeholder="Price" className="border p-2 rounded col-span-2" type="number" value={form.price} onChange={(e)=>setForm({...form, price: parseFloat(e.target.value)})} />
        )}
        <input placeholder="Quantity" className="border p-2 rounded col-span-2" type="number" value={form.qty} onChange={(e)=>setForm({...form, qty: parseFloat(e.target.value)})} />
        <button className="col-span-2 bg-blue-600 text-white py-2 rounded" onClick={async ()=>{
          const payload = { symbol: form.symbol, side: form.side, type: form.type, qty: Number(form.qty) }
          if (form.type === 'LIMIT') payload.price = Number(form.price)
          await api.post('/api/orders', payload)
          alert('Order submitted')
        }}>Submit</button>
      </div>
    </div>
  )}


