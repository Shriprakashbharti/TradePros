import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'

export default function RecentTrades({ symbol }) {
  const [trades, setTrades] = useState([])
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    const base = import.meta.env.VITE_WS_BASE || 'ws://localhost:5000'
    
    try {
      const socket = io(base + '/ws', { 
        auth: { token },
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      })

      socket.on('connect', () => {
        setIsConnected(true)
        setError(null)
        socket.emit('market:subscribe', { symbol })
      })

      socket.on('disconnect', () => {
        setIsConnected(false)
      })

      socket.on('connect_error', (err) => {
        setError(`Connection error: ${err.message}`)
        setIsConnected(false)
      })

      const handler = (trade) => {
        if (trade.symbol === symbol) {
          setTrades((t) => [{
            ...trade,
            id: `${trade.createdAt}-${trade.price}-${trade.qty}` // Unique ID for key prop
          }, ...t].slice(0, 50))
        }
      }

      socket.on('trades:updated', handler)

      return () => {
        socket.off('trades:updated', handler)
        socket.disconnect()
      }
    } catch (err) {
      setError(`Failed to connect: ${err.message}`)
    }
  }, [symbol])

  const formatPrice = (price) => {
    return parseFloat(price).toFixed(2)
  }

  const formatQty = (qty) => {
    return parseFloat(qty).toFixed(4)
  }

  return (
    <div className="border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        <h3 className="font-semibold text-gray-800">Recent Trades - {symbol}</h3>
        <div className="flex items-center space-x-2">
          <span className={`inline-block w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
          <span className="text-xs text-gray-500">
            {isConnected ? 'Live' : 'Disconnected'}
          </span>
        </div>
      </div>
      
      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Side</th>
              <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
              <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {trades.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-4 text-center text-sm text-gray-500">
                  {isConnected ? 'Waiting for trade data...' : 'Disconnected from server'}
                </td>
              </tr>
            ) : (
              trades.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                    {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      t.side.toLowerCase() === 'buy' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {t.side}
                    </span>
                  </td>
                  <td className={`px-4 py-2 whitespace-nowrap text-sm text-right font-medium ${
                    t.side.toLowerCase() === 'buy' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatPrice(t.price)}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-gray-500">
                    {formatQty(t.qty)}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-gray-500">
                    {formatPrice(t.price * t.qty)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}