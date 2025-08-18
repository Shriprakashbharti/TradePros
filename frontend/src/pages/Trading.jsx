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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Trading Dashboard</h1>
          <div className="flex items-center mt-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {currentSymbol}
            </span>
            <span className="ml-4 text-sm text-gray-500">
              Connected to {symbol || 'market data'}
            </span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow p-4">
              <PriceChart symbol={currentSymbol} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-4">
                <h2 className="text-lg font-semibold mb-4 text-gray-700">Order Book</h2>
                <OrderBook />
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <h2 className="text-lg font-semibold mb-4 text-gray-700">Recent Trades</h2>
                <RecentTrades symbol={currentSymbol} />
              </div>
            </div>
          </div>

          {/* Order Ticket Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-4 sticky top-4">
              <h2 className="text-lg font-semibold mb-4 text-gray-700">New Order</h2>
              <OrderTicket />
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-4 text-gray-700">Portfolio Summary</h2>
              <div className="text-gray-500 text-sm">
                Portfolio data would be displayed here
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}