import { useMarket } from '../store/market'
import { useEffect, useMemo, useState } from 'react'
import { AreaChart, Area, ResponsiveContainer } from 'recharts'

export default function OrderBook() {
  const { orderbook, tick } = useMarket()
  const [zoom, setZoom] = useState(1)
  const [displayMode, setDisplayMode] = useState('full') // 'full' or 'compact'

  // Process order book data with cumulative quantities
  const { bids, asks, maxTotal } = useMemo(() => {
    if (!orderbook) return { bids: [], asks: [], maxTotal: 0 }

    // Process bids (descending price)
    const processedBids = orderbook.bids
      .sort((a, b) => b.price - a.price)
      .reduce((acc, bid) => {
        const last = acc[acc.length - 1]
        const total = last ? last.total + bid.qty : bid.qty
        acc.push({ ...bid, total })
        return acc
      }, [])

    // Process asks (ascending price)
    const processedAsks = orderbook.asks
      .sort((a, b) => a.price - b.price)
      .reduce((acc, ask) => {
        const last = acc[acc.length - 1]
        const total = last ? last.total + ask.qty : ask.qty
        acc.push({ ...ask, total })
        return acc
      }, [])

    const maxBidTotal = processedBids.length ? processedBids[processedBids.length - 1].total : 0
    const maxAskTotal = processedAsks.length ? processedAsks[processedAsks.length - 1].total : 0
    const maxTotal = Math.max(maxBidTotal, maxAskTotal)

    return {
      bids: processedBids,
      asks: processedAsks,
      maxTotal
    }
  }, [orderbook])

  // Format price with proper decimals
  const formatPrice = (price) => {
    if (!price) return '-'
    const tickSize = tick?.tickSize || 0.01
    const decimals = Math.max(0, Math.ceil(-Math.log10(tickSize)))
    return price.toFixed(decimals)
  }

  // Format quantity
  const formatQty = (qty) => {
    return qty.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 4
    })
  }

  // Create data for depth chart
  const depthChartData = useMemo(() => {
    if (!bids.length || !asks.length) return []
    
    const midPrice = (bids[0].price + asks[0].price) / 2
    const priceRange = (asks[0].price - bids[0].price) * zoom
    
    const minPrice = midPrice - priceRange / 2
    const maxPrice = midPrice + priceRange / 2
    
    // Combine bids and asks for the chart
    const bidData = bids
      .filter(b => b.price >= minPrice)
      .map(b => ({ price: b.price, bids: b.total, asks: 0 }))
    
    const askData = asks
      .filter(a => a.price <= maxPrice)
      .map(a => ({ price: a.price, bids: 0, asks: a.total }))
    
    return [...bidData, ...askData].sort((a, b) => a.price - b.price)
  }, [bids, asks, zoom])

  return (
    <div className="border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <h3 className="font-semibold text-gray-800">Order Book</h3>
        <div className="flex space-x-2">
          <button 
            onClick={() => setDisplayMode(displayMode === 'full' ? 'compact' : 'full')}
            className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
          >
            {displayMode === 'full' ? 'Compact View' : 'Full View'}
          </button>
          <div className="flex items-center space-x-1">
            <button 
              onClick={() => setZoom(Math.min(5, zoom + 0.5))}
              disabled={zoom >= 5}
              className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded disabled:opacity-50"
            >
              +
            </button>
            <button 
              onClick={() => setZoom(Math.max(1, zoom - 0.5))}
              disabled={zoom <= 1}
              className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded disabled:opacity-50"
            >
              -
            </button>
          </div>
        </div>
      </div>

      {displayMode === 'full' && (
        <div className="h-40 p-2 border-b">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={depthChartData}>
              <defs>
                <linearGradient id="colorBids" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorAsks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="bids" stroke="#10B981" fill="url(#colorBids)" />
              <Area type="monotone" dataKey="asks" stroke="#EF4444" fill="url(#colorAsks)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-2 divide-x divide-gray-200">
        {/* Bids */}
        <div className="p-2">
          <div className="font-semibold text-green-600 mb-1 text-sm">Bids (Buy)</div>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-500">
                <th className="text-left py-1">Price</th>
                <th className="text-right py-1">Size</th>
                <th className="text-right py-1">Total</th>
              </tr>
            </thead>
            <tbody>
              {bids.slice(0, displayMode === 'compact' ? 5 : 10).map((b, idx) => (
                <tr key={idx} className="hover:bg-gray-50 group">
                  <td className="text-green-600 py-1">{formatPrice(b.price)}</td>
                  <td className="text-right py-1">{formatQty(b.qty)}</td>
                  <td className="text-right py-1 text-gray-500">{formatQty(b.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Asks */}
        <div className="p-2">
          <div className="font-semibold text-red-600 mb-1 text-sm">Asks (Sell)</div>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-500">
                <th className="text-left py-1">Price</th>
                <th className="text-right py-1">Size</th>
                <th className="text-right py-1">Total</th>
              </tr>
            </thead>
            <tbody>
              {asks.slice(0, displayMode === 'compact' ? 5 : 10).map((a, idx) => (
                <tr key={idx} className="hover:bg-gray-50 group">
                  <td className="text-red-600 py-1">{formatPrice(a.price)}</td>
                  <td className="text-right py-1">{formatQty(a.qty)}</td>
                  <td className="text-right py-1 text-gray-500">{formatQty(a.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {displayMode === 'full' && (
        <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 flex justify-between">
          <div>Spread: {asks[0] && bids[0] ? formatPrice(asks[0].price - bids[0].price) : '-'}</div>
          <div>Zoom: {zoom}x</div>
        </div>
      )}
    </div>
  )
}