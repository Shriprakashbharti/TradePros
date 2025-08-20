import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import PortfolioCards from '../components/PortfolioCards'
import { useAuth } from '../store/auth'
import api from '../lib/api'

export default function Portfolio() {
  const { user } = useAuth()
  const [activeView, setActiveView] = useState('holdings')
  const [timeRange, setTimeRange] = useState('1M')
  const [portfolioData, setPortfolioData] = useState({
    totalValue: 0,
    todayChange: { amount: 0, percentage: 0 },
    unrealizedPL: 0,
    holdings: [],
    recentActivity: []
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch real-time portfolio data
  useEffect(() => {
    const fetchPortfolioData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await api.get('/api/portfolio', {
          params: {
            range: timeRange
          }
        })
        setPortfolioData(response.data)
      } catch (error) {
        console.error('Error fetching portfolio data:', error)
        setError(error.response?.data?.error || 'Failed to fetch portfolio data')
      } finally {
        setIsLoading(false)
      }
    }
  
    if (user.id) {  // Only fetch if user exists
      fetchPortfolioData()
      const interval = setInterval(fetchPortfolioData, 30000) // Refresh every 30 seconds
      return () => clearInterval(interval)
    }
  }, [timeRange, user.id])

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0)
  }

  // Format percentage
  const formatPercentage = (value) => {
    return `${value >= 0 ? '+' : ''}${(value || 0).toFixed(2)}%`
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">My Portfolio</h1>
            {isLoading ? (
              <div className="animate-pulse h-6 w-48 bg-gray-200 rounded mt-2"></div>
            ) : error ? (
              <p className="text-red-600 mt-2">{error}</p>
            ) : (
              <p className="text-gray-600 mt-2">
                Total value: <span className="font-semibold text-gray-900">
                  {formatCurrency(portfolioData.totalValue)}
                </span>
                <span className={`ml-2 ${portfolioData.todayChange?.percentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercentage(portfolioData.todayChange?.percentage)}
                </span>
              </p>
            )}
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <Link
              to="/trading"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Trade Assets
            </Link>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading portfolio data</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Time Range Selector */}
        <div className="flex justify-end mb-6">
          <div className="inline-flex rounded-md shadow-sm">
            {['1D', '1W', '1M', '3M', '1Y', 'ALL'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                disabled={isLoading}
                className={`px-3 py-1 text-sm font-medium ${timeRange === range 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'} 
                  ${range === '1D' ? 'rounded-l-md' : ''} 
                  ${range === 'ALL' ? 'rounded-r-md' : ''} 
                  border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Portfolio Views */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* View Toggle */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {['holdings', 'performance', 'allocation'].map((view) => (
                  <button
                    key={view}
                    onClick={() => setActiveView(view)}
                    disabled={isLoading}
                    className={`${activeView === view 
                      ? 'border-blue-500 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} 
                      whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {view}
                  </button>
                ))}
              </nav>
            </div>

            {/* Content Area */}
            {isLoading ? (
              <div className="bg-white shadow rounded-lg p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-6 w-1/3 bg-gray-200 rounded"></div>
                  <div className="h-64 bg-gray-100 rounded-md"></div>
                </div>
              </div>
            ) : error ? (
              <div className="bg-white shadow rounded-lg p-6">
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Unable to load data</h3>
                  <p className="mt-1 text-sm text-gray-500">{error}</p>
                  <div className="mt-6">
                    <button
                      onClick={() => window.location.reload()}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {activeView === 'holdings' && (
                  <div className="bg-white shadow rounded-lg overflow-hidden">
                    <PortfolioCards 
                      holdings={portfolioData.holdings}
                      summary={{
                        totalValue: portfolioData.totalValue,
                        totalUnrealized: portfolioData.unrealizedPL,
                        positionsCount: portfolioData.holdings?.length || 0,
                        dayChange: portfolioData.todayChange?.amount || 0
                      }}
                      loading={isLoading}
                      error={error}
                    />
                  </div>
                )}

                {activeView === 'performance' && (
                  <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Portfolio Performance</h2>
                    <div className="h-64 bg-gray-100 rounded-md flex items-center justify-center">
                      {/* Replace with actual chart component */}
                      <p className="text-gray-500">Performance chart for {timeRange} time period</p>
                    </div>
                  </div>
                )}

                {activeView === 'allocation' && (
                  <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Asset Allocation</h2>
                    <div className="h-64 bg-gray-100 rounded-md flex items-center justify-center">
                      {/* Replace with actual chart component */}
                      <p className="text-gray-500">Allocation visualization</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Portfolio Snapshot</h2>
              {isLoading ? (
                <div className="space-y-4">
                  <div className="animate-pulse h-8 w-full bg-gray-200 rounded"></div>
                  <div className="animate-pulse h-8 w-full bg-gray-200 rounded"></div>
                  <div className="animate-pulse h-8 w-full bg-gray-200 rounded"></div>
                </div>
              ) : error ? (
                <div className="text-center py-4 text-gray-500">
                  Data unavailable
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Total Value</p>
                    <p className="text-2xl font-semibold">
                      {formatCurrency(portfolioData.totalValue)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Today's Change</p>
                    <p className={`text-xl font-semibold ${
                      portfolioData.todayChange?.amount >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {portfolioData.todayChange?.amount >= 0 ? '+' : ''}
                      {formatCurrency(portfolioData.todayChange?.amount)} (
                      {formatPercentage(portfolioData.todayChange?.percentage)})
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Unrealized P/L</p>
                    <p className={`text-xl font-semibold ${
                      portfolioData.unrealizedPL >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {portfolioData.unrealizedPL >= 0 ? '+' : ''}
                      {formatCurrency(portfolioData.unrealizedPL)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
              {isLoading ? (
                <div className="space-y-3">
                  <div className="animate-pulse h-4 w-full bg-gray-200 rounded"></div>
                  <div className="animate-pulse h-4 w-full bg-gray-200 rounded"></div>
                  <div className="animate-pulse h-4 w-full bg-gray-200 rounded"></div>
                </div>
              ) : error ? (
                <div className="text-center py-4 text-gray-500">
                  Activity data unavailable
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {portfolioData.recentActivity && portfolioData.recentActivity.length > 0 ? (
                      portfolioData.recentActivity.slice(0, 3).map((activity, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="truncate max-w-xs">{activity.description}</span>
                          <span className="text-gray-500 whitespace-nowrap ml-2">
                            {new Date(activity.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">No recent activity</p>
                    )}
                  </div>
                  {portfolioData.recentActivity && portfolioData.recentActivity.length > 0 && (
                    <Link 
                      to="/activity" 
                      className="text-blue-600 hover:text-blue-500 text-sm mt-3 inline-block"
                    >
                      View all activity
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}