import { useEffect } from 'react'
import PriceChart from '../components/PriceChart'
import OrderBook from '../components/OrderBook'
import OrderTicket from '../components/OrderTicket'
import RecentTrades from '../components/RecentTrades'
import { useMarket } from '../store/market'

export default function Trading() {
  const { instruments, init, symbol, connect, disconnect } = useMarket()
  useEffect(() => { init() }, [])
  const currentSymbol = instruments[0]?.symbol || 'AAPL'
  useEffect(() => { if (currentSymbol) { connect(currentSymbol); return () => disconnect(currentSymbol) } }, [currentSymbol])
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-2 space-y-4">
        <PriceChart symbol={currentSymbol} />
        <OrderBook />
      </div>
      <div className="space-y-4">
        <OrderTicket />
        <RecentTrades symbol={currentSymbol} />
      </div>
    </div>
  )
}


