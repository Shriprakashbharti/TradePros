import { useEffect, useState } from 'react'
import PriceChart from '../components/PriceChart'
import OrderBook from '../components/OrderBook'
import OrderTicket from '../components/OrderTicket'
import RecentTrades from '../components/RecentTrades'
import { useMarket } from '../store/market'
import ErrorBoundary from '../components/ErrorBoundary'

export default function Trading() {
  const { instruments, init, symbol, connect, disconnect, setSymbol } = useMarket()
  const [selectedSymbol, setSelectedSymbol] = useState(symbol || '')
  
  useEffect(() => { 
    init() 
  }, [])
  
  // Set initial symbol once instruments are loaded
  useEffect(() => {
    if (instruments.length > 0 && !selectedSymbol) {
      const initialSymbol = instruments[0]?.symbol || 'AAPL'
      setSelectedSymbol(initialSymbol)
      setSymbol(initialSymbol)
    }
  }, [instruments, selectedSymbol, setSymbol])
  
  // Connect to market data when symbol changes
  useEffect(() => { 
    if (selectedSymbol) { 
      connect(selectedSymbol); 
      return () => disconnect(selectedSymbol) 
    } 
  }, [selectedSymbol, connect, disconnect])
  
  const handleSymbolChange = (newSymbol) => {
    setSelectedSymbol(newSymbol)
    setSymbol(newSymbol)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Trading Dashboard</h1>
            
            {/* Symbol Dropdown */}
            <div className="flex items-center">
              <label htmlFor="symbol-select" className="mr-2 text-sm font-medium text-gray-700">
                Symbol:
              </label>
              <select
                id="symbol-select"
                className="border border-gray-300 rounded-md shadow-sm px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={selectedSymbol}
                onChange={(e) => handleSymbolChange(e.target.value)}
              >
                {instruments.map((i) => (
                  <option key={i.symbol} value={i.symbol}>
                    {i.symbol}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex items-center mt-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {selectedSymbol}
            </span>
            <span className="ml-4 text-sm text-gray-500">
              Connected to {selectedSymbol || 'market data'}
            </span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow p-4">
            <ErrorBoundary>
  <PriceChart symbol={selectedSymbol} />
</ErrorBoundary>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-4">
                <h2 className="text-lg font-semibold mb-4 text-gray-700">Order Book</h2>
                <ErrorBoundary>
  <OrderBook symbol={selectedSymbol} />
</ErrorBoundary>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <h2 className="text-lg font-semibold mb-4 text-gray-700">Recent Trades</h2>
                <ErrorBoundary>
  <RecentTrades symbol={selectedSymbol} />
</ErrorBoundary>
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