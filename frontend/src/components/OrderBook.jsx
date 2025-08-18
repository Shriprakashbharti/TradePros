import { useMarket } from '../store/market'

export default function OrderBook() {
  const { orderbook } = useMarket()
  return (
    <div className="border rounded p-3 bg-white">
      <div className="font-semibold mb-2">Order Book</div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="font-semibold text-green-600 mb-1">Bids</div>
          <table className="w-full text-sm">
            <thead><tr><th className="text-left">Price</th><th className="text-left">Qty</th></tr></thead>
            <tbody>
              {orderbook.bids?.map((b, idx)=>(
                <tr key={idx}><td>{b.price}</td><td>{b.qty}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <div className="font-semibold text-red-600 mb-1">Asks</div>
          <table className="w-full text-sm">
            <thead><tr><th className="text-left">Price</th><th className="text-left">Qty</th></tr></thead>
            <tbody>
              {orderbook.asks?.map((a, idx)=>(
                <tr key={idx}><td>{a.price}</td><td>{a.qty}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}


