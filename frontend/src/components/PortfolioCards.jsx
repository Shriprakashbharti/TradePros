import { useEffect, useState } from 'react'
import api from '../lib/api'
import { ArrowUpIcon, ArrowDownIcon, CurrencyDollarIcon, ChartBarIcon, CubeIcon } from '@heroicons/react/24/outline'

export default function PortfolioCards() {
  const [summary, setSummary] = useState({ 
    totalUnrealized: 0, 
    totalRealized: 0, 
    positionsCount: 0,
    totalValue: 0,
    dayChange: 0
  })
  const [positions, setPositions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const [{ data: s }, { data: p }] = await Promise.all([
          api.get('/api/portfolio/summary'),
          api.get('/api/portfolio/positions')
        ])
        
        setSummary(s)
        setPositions(p)
      } catch (err) {
        setError('Failed to load portfolio data. Please try again later.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  const formatNumber = (value, decimals = 2) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value)
  }

  const getPnLColor = (value) => {
    if (value > 0) return 'text-green-600'
    if (value < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const getPnLIcon = (value) => {
    if (value > 0) return <ArrowUpIcon className="h-4 w-4 inline mr-1" />
    if (value < 0) return <ArrowDownIcon className="h-4 w-4 inline mr-1" />
    return null
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-5 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Portfolio Value Card */}
          <div className="p-5 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <CurrencyDollarIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-sm font-medium text-gray-500">Portfolio Value</div>
            </div>
            <div className="text-2xl font-bold mb-1">{formatCurrency(summary.totalValue)}</div>
            <div className={`text-sm ${getPnLColor(summary.dayChange)}`}>
              {getPnLIcon(summary.dayChange)}
              {formatCurrency(summary.dayChange)} ({(summary.dayChange / summary.totalValue * 100).toFixed(2)}%) today
            </div>
          </div>

          {/* Unrealized P&L Card */}
          <div className="p-5 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <ChartBarIcon className="h-5 w-5 text-purple-600" />
              </div>
              <div className="text-sm font-medium text-gray-500">Unrealized P&L</div>
            </div>
            <div className={`text-2xl font-bold mb-1 ${getPnLColor(summary.totalUnrealized)}`}>
              {getPnLIcon(summary.totalUnrealized)}
              {formatCurrency(summary.totalUnrealized)}
            </div>
            <div className="text-sm text-gray-500">
              {(summary.totalUnrealized / summary.totalValue * 100).toFixed(2)}% of portfolio
            </div>
          </div>

          {/* Positions Card */}
          <div className="p-5 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <CubeIcon className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-sm font-medium text-gray-500">Positions</div>
            </div>
            <div className="text-2xl font-bold mb-1">{summary.positionsCount}</div>
            <div className="text-sm text-gray-500">
              {positions.length} active {positions.length === 1 ? 'position' : 'positions'}
            </div>
          </div>
        </div>
      )}

      {/* Positions Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-800">Your Positions</h3>
        </div>
        
        {loading ? (
          <div className="p-5">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        ) : positions.length === 0 ? (
          <div className="p-5 text-center text-gray-500">
            You don't have any open positions
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
                  <th scope="col" className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th scope="col" className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Price</th>
                  <th scope="col" className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Current Price</th>
                  <th scope="col" className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                  <th scope="col" className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unrealized P&L</th>
                  <th scope="col" className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Realized P&L</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {positions.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50">
                    <td className="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.symbol}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-right text-gray-500">{formatNumber(p.qty, 4)}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-right text-gray-500">{formatCurrency(p.avgPrice)}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-right text-gray-500">{formatCurrency(p.currentPrice)}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-right text-gray-500">{formatCurrency(p.qty * p.currentPrice)}</td>
                    <td className={`px-5 py-4 whitespace-nowrap text-sm text-right font-medium ${getPnLColor(p.unrealizedPnL)}`}>
                      {getPnLIcon(p.unrealizedPnL)}
                      {formatCurrency(p.unrealizedPnL)}
                    </td>
                    <td className={`px-5 py-4 whitespace-nowrap text-sm text-right font-medium ${getPnLColor(p.realizedPnL)}`}>
                      {getPnLIcon(p.realizedPnL)}
                      {formatCurrency(p.realizedPnL)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}