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
    holdings: []
  })
  const [isLoading, setIsLoading] = useState(true)
  // Fetch real-time portfolio data
  useEffect(() => {
    const fetchPortfolioData = async () => {
      try {
        setIsLoading(true)
        const response = await api.get('/api/portfolio', {
          params: {
            range: timeRange
          }
        })
        setPortfolioData(response.data)
      } catch (error) {
        console.error('Error fetching portfolio data:', error)
        if (error.response) {
          console.error('Error details:', error.response.data)
          // You might want to set an error state here
        }
      } finally {
        setIsLoading(false)
      }
    }
  
    if (user.id) {  // Only fetch if user exists
      fetchPortfolioData()
      const interval = setInterval(fetchPortfolioData, 5000)
      return () => clearInterval(interval)
    }
  }, [timeRange, user.id])  // Add dependency on user existence
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  // Format percentage
  const formatPercentage = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
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
            ) : (
              <p className="text-gray-600 mt-2">
                Total value: <span className="font-semibold text-gray-900">
                  {formatCurrency(portfolioData.totalValue)}
                </span>
                <span className={`ml-2 ${portfolioData.todayChange.percentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercentage(portfolioData.todayChange.percentage)}
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

        {/* Time Range Selector */}
        <div className="flex justify-end mb-6">
          <div className="inline-flex rounded-md shadow-sm">
            {['1D', '1W', '1M', '3M', '1Y', 'ALL'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-sm font-medium ${timeRange === range 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'} 
                  ${range === '1D' ? 'rounded-l-md' : ''} 
                  ${range === 'ALL' ? 'rounded-r-md' : ''} 
                  border border-gray-300`}
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
                    className={`${activeView === view 
                      ? 'border-blue-500 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} 
                      whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
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
      error={null} // You can add error state if needed
    />
  </div>
)}

                {activeView === 'performance' && (
                  <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Portfolio Performance</h2>
                    <div className="h-64 bg-gray-100 rounded-md flex items-center justify-center">
                      {/* Replace with actual chart component */}
                      <p>Performance chart for {timeRange} time period</p>
                    </div>
                  </div>
                )}

                {activeView === 'allocation' && (
                  <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Asset Allocation</h2>
                    <div className="h-64 bg-gray-100 rounded-md flex items-center justify-center">
                      {/* Replace with actual chart component */}
                      <p>Allocation visualization</p>
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
                      portfolioData.todayChange.amount >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {portfolioData.todayChange.amount >= 0 ? '+' : ''}
                      {formatCurrency(portfolioData.todayChange.amount)} (
                      {formatPercentage(portfolioData.todayChange.percentage)})
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
              ) : (
                <>
                  <div className="space-y-3">
                    {portfolioData.recentActivity?.slice(0, 3).map((activity, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{activity.description}</span>
                        <span className="text-gray-500">
                          {new Date(activity.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                  <Link 
                    to="/activity" 
                    className="text-blue-600 hover:text-blue-500 text-sm mt-3 inline-block"
                  >
                    View all activity
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}