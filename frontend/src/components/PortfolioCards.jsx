import { ArrowUpIcon, ArrowDownIcon, CurrencyDollarIcon, ChartBarIcon, CubeIcon } from '@heroicons/react/24/outline'

export default function PortfolioCards({ holdings, summary, loading, error }) {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value || 0)
  }

  const formatNumber = (value, decimals = 2) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value || 0)
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

  // Calculate summary from holdings if not provided
  const calculatedSummary = summary || {
    totalValue: holdings?.reduce((sum, h) => sum + (h.currentValue || 0), 0) || 0,
    totalUnrealized: holdings?.reduce((sum, h) => sum + (h.unrealizedPL || 0), 0) || 0,
    positionsCount: holdings?.length || 0,
    dayChange: 0 // This should come from parent component
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
            <div className="text-2xl font-bold mb-1">{formatCurrency(calculatedSummary.totalValue)}</div>
            <div className="text-sm text-gray-500">
              {calculatedSummary.positionsCount} positions
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
            <div className={`text-2xl font-bold mb-1 ${getPnLColor(calculatedSummary.totalUnrealized)}`}>
              {getPnLIcon(calculatedSummary.totalUnrealized)}
              {formatCurrency(calculatedSummary.totalUnrealized)}
            </div>
            <div className="text-sm text-gray-500">
              {calculatedSummary.totalValue > 0 ? 
                `${((calculatedSummary.totalUnrealized / calculatedSummary.totalValue) * 100).toFixed(2)}% of portfolio` : 
                'No portfolio value'
              }
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
            <div className="text-2xl font-bold mb-1">{calculatedSummary.positionsCount}</div>
            <div className="text-sm text-gray-500">
              {calculatedSummary.positionsCount === 1 ? 'position' : 'positions'} total
            </div>
          </div>
        </div>
      )}

      {/* Holdings Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-800">Your Holdings</h3>
        </div>
        
        {loading ? (
          <div className="p-5">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        ) : !holdings || holdings.length === 0 ? (
          <div className="p-5 text-center text-gray-500">
            You don't have any holdings
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
                  <th scope="col" className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">P&L</th>
                  <th scope="col" className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">P&L %</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {holdings.map((holding) => (
                  <tr key={holding.symbol} className="hover:bg-gray-50">
                    <td className="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{holding.symbol}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-right text-gray-500">{formatNumber(holding.quantity, 4)}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-right text-gray-500">{formatCurrency(holding.avgPrice)}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-right text-gray-500">{formatCurrency(holding.currentPrice)}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-right text-gray-500">{formatCurrency(holding.currentValue)}</td>
                    <td className={`px-5 py-4 whitespace-nowrap text-sm text-right font-medium ${getPnLColor(holding.unrealizedPL)}`}>
                      {getPnLIcon(holding.unrealizedPL)}
                      {formatCurrency(holding.unrealizedPL)}
                    </td>
                    <td className={`px-5 py-4 whitespace-nowrap text-sm text-right font-medium ${getPnLColor(holding.unrealizedPLPercent)}`}>
                      {getPnLIcon(holding.unrealizedPLPercent)}
                      {formatNumber(holding.unrealizedPLPercent)}%
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