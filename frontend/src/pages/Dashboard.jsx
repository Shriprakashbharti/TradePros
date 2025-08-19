import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import PortfolioCards from '../components/PortfolioCards'
import { useAuth } from '../store/auth'
import api from '../lib/api'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('portfolio')
  const { user } = useAuth()
  const [timeRange, setTimeRange] = useState('1M')
  const [portfolioData, setPortfolioData] = useState({
    totalValue: 0,
    todayChange: { amount: 0, percentage: 0 },
    unrealizedPL: 0,
    holdings: [],
    recentActivity: [],
    cashBalance: 0
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
        }
      } finally {
        setIsLoading(false)
      }
    }
  
    if (user?.id) {
      fetchPortfolioData()
      const interval = setInterval(fetchPortfolioData, 5000)
      return () => clearInterval(interval)
    }
  }, [timeRange, user?.id])
  
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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Dashboard</h1>
          <div className="mt-4 md:mt-0">
            <Link 
              to="/trading" 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Start Trading
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

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`${activeTab === 'portfolio' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Portfolio
            </button>
            <button
              onClick={() => setActiveTab('watchlist')}
              className={`${activeTab === 'watchlist' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Watchlist
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`${activeTab === 'activity' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Recent Activity
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Primary Content */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === 'portfolio' && (
              <>
                {isLoading ? (
                  <div className="animate-pulse bg-white shadow rounded-lg p-6">
                    <div className="h-6 w-1/3 bg-gray-200 rounded mb-4"></div>
                    <div className="h-32 bg-gray-100 rounded-md"></div>
                  </div>
                ) : (
                  <PortfolioCards 
                    holdings={portfolioData.holdings}
                    summary={{
                      totalValue: portfolioData.totalValue,
                      totalUnrealized: portfolioData.unrealizedPL,
                      positionsCount: portfolioData.holdings?.length || 0,
                      dayChange: portfolioData.todayChange?.amount || 0
                    }}
                    loading={isLoading}
                    error={null}
                  />
                )}
                
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Performance Chart</h2>
                  {isLoading ? (
                    <div className="animate-pulse h-64 bg-gray-100 rounded-md"></div>
                  ) : (
                    <div className="h-64 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                      Portfolio performance visualization for {timeRange}
                    </div>
                  )}
                </div>
              </>
            )}

            {activeTab === 'watchlist' && (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Your Watchlist</h2>
                <div className="text-center py-12 text-gray-500">
                  <p>No assets in watchlist</p>
                  <Link to="/markets" className="text-blue-600 hover:text-blue-500 text-sm mt-2 inline-block">
                    Browse markets
                  </Link>
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
                {isLoading ? (
                  <div className="space-y-3">
                    <div className="animate-pulse h-4 w-full bg-gray-200 rounded"></div>
                    <div className="animate-pulse h-4 w-full bg-gray-200 rounded"></div>
                    <div className="animate-pulse h-4 w-full bg-gray-200 rounded"></div>
                  </div>
                ) : portfolioData.recentActivity?.length > 0 ? (
                  <div className="space-y-3">
                    {portfolioData.recentActivity.slice(0, 5).map((activity, index) => (
                      <div key={index} className="flex justify-between text-sm border-b border-gray-100 pb-2">
                        <span>{activity.description}</span>
                        <span className="text-gray-500">
                          {new Date(activity.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <p>No recent activity</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Secondary Content (Sidebar) */}
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Market Overview</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">S&P 500</span>
                  <span className="text-green-600 font-medium">+1.25%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">NASDAQ</span>
                  <span className="text-green-600 font-medium">+2.15%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">DOW</span>
                  <span className="text-red-600 font-medium">-0.45%</span>
                </div>
              </div>
              <Link to="/markets" className="text-blue-600 hover:text-blue-500 text-sm mt-4 inline-block">
                View all markets
              </Link>
            </div>

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
                    <p className="text-sm text-gray-500">Cash Balance</p>
                    <p className="text-xl font-semibold">
                      {formatCurrency(portfolioData.cashBalance)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                <Link 
                  to="/deposit" 
                  className="p-3 border border-gray-200 rounded-md text-center hover:bg-gray-50"
                >
                  <div className="text-blue-600 font-medium text-sm">Deposit</div>
                </Link>
                <Link 
                  to="/withdraw" 
                  className="p-3 border border-gray-200 rounded-md text-center hover:bg-gray-50"
                >
                  <div className="text-blue-600 font-medium text-sm">Withdraw</div>
                </Link>
                <Link 
                  to="/trading" 
                  className="p-3 border border-gray-200 rounded-md text-center hover:bg-gray-50"
                >
                  <div className="text-blue-600 font-medium text-sm">Buy</div>
                </Link>
                <Link 
                  to="/trading" 
                  className="p-3 border border-gray-200 rounded-md text-center hover:bg-gray-50"
                >
                  <div className="text-blue-600 font-medium text-sm">Sell</div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}