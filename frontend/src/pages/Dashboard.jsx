import PortfolioCards from '../components/PortfolioCards'
import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('portfolio')
  
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
          {/* Primary Content (Portfolio) */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === 'portfolio' && (
              <>
                <PortfolioCards />
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Performance Chart</h2>
                  <div className="h-64 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                    Portfolio performance visualization
                  </div>
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
                <div className="text-center py-12 text-gray-500">
                  <p>No recent activity</p>
                </div>
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