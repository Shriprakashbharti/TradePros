import { useState, useEffect } from 'react'
import { 
  ExclamationTriangleIcon, 
  XMarkIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ShieldCheckIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

export default function Risk() {
  const [alerts, setAlerts] = useState([])
  const [riskMetrics, setRiskMetrics] = useState({
    exposure: 0,
    maxDrawdown: 0,
    winRate: 0,
    sharpeRatio: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  // Simulate fetching risk data
  useEffect(() => {
    const fetchRiskData = async () => {
      setIsLoading(true)
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Example data
      const exampleAlerts = [
        {
          id: 1,
          message: 'Order size exceeds 10% of daily volume',
          level: 'warning',
          timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          symbol: 'BTC/USDT'
        },
        {
          id: 2,
          message: 'Potential slippage detected on market order',
          level: 'error',
          timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
          symbol: 'ETH/USDT'
        },
        {
          id: 3,
          message: 'Portfolio concentration > 30% in single asset',
          level: 'warning',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          symbol: 'SOL/USDT'
        }
      ]

      const exampleMetrics = {
        exposure: 0.45,
        maxDrawdown: -0.12,
        winRate: 0.68,
        sharpeRatio: 1.42
      }

      setAlerts(exampleAlerts)
      setRiskMetrics(exampleMetrics)
      setIsLoading(false)
    }

    fetchRiskData()
  }, [])

  const removeAlert = (id) => {
    setAlerts(alerts.filter(alert => alert.id !== id))
  }

  const dismissAllAlerts = () => {
    setAlerts([])
  }

  const getAlertColor = (level) => {
    switch(level) {
      case 'error': return 'bg-red-50 border-red-200 text-red-700'
      case 'warning': return 'bg-amber-50 border-amber-200 text-amber-700'
      default: return 'bg-blue-50 border-blue-200 text-blue-700'
    }
  }

  const getAlertIcon = (level) => {
    switch(level) {
      case 'error': return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
      case 'warning': return <ExclamationTriangleIcon className="h-5 w-5 text-amber-500" />
      default: return <ExclamationTriangleIcon className="h-5 w-5 text-blue-500" />
    }
  }

  const formatMetricValue = (value, type = 'percent') => {
    if (type === 'percent') {
      return `${(value * 100).toFixed(2)}%`
    }
    return value.toFixed(2)
  }

  const getMetricTrend = (value) => {
    if (value > 0) return 'positive'
    if (value < 0) return 'negative'
    return 'neutral'
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Risk Dashboard</h2>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="animate-pulse bg-gray-100 h-32 rounded-lg"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-100 h-24 rounded-lg"></div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Key Risk Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard 
              title="Exposure" 
              value={riskMetrics.exposure} 
              type="percent"
              icon={<ChartBarIcon className="h-5 w-5" />}
              trend={riskMetrics.exposure > 0.4 ? 'high' : 'low'}
            />
            <MetricCard 
              title="Max Drawdown" 
              value={riskMetrics.maxDrawdown} 
              type="percent"
              icon={<ArrowTrendingDownIcon className="h-5 w-5" />}
              trend={getMetricTrend(riskMetrics.maxDrawdown)}
            />
            <MetricCard 
              title="Win Rate" 
              value={riskMetrics.winRate} 
              type="percent"
              icon={<ShieldCheckIcon className="h-5 w-5" />}
              trend={getMetricTrend(riskMetrics.winRate - 0.5)}
            />
            <MetricCard 
              title="Sharpe Ratio" 
              value={riskMetrics.sharpeRatio} 
              icon={<ArrowTrendingUpIcon className="h-5 w-5" />}
              trend={getMetricTrend(riskMetrics.sharpeRatio - 1)}
            />
          </div>

          {/* Risk Alerts */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="font-semibold text-gray-800">Active Alerts</h3>
              {alerts.length > 0 && (
                <button 
                  onClick={dismissAllAlerts}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Dismiss all
                </button>
              )}
            </div>
            
            <div className="divide-y divide-gray-200">
              {alerts.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No active risk alerts detected
                </div>
              ) : (
                alerts.map(alert => (
                  <div 
                    key={alert.id}
                    className={`flex items-start p-4 ${getAlertColor(alert.level)}`}
                  >
                    <div className="mr-3 mt-0.5">
                      {getAlertIcon(alert.level)}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{alert.message}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(alert.timestamp).toLocaleString()} • {alert.symbol}
                      </div>
                    </div>
                    <button 
                      onClick={() => removeAlert(alert.id)}
                      className="ml-2 text-gray-400 hover:text-gray-600"
                      aria-label="Dismiss alert"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Risk Explanation */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Understanding Your Risk Profile</h4>
            <p className="text-xs text-blue-700">
              Risk metrics help you assess your trading strategy's performance and potential vulnerabilities. 
              Monitor these indicators regularly to maintain a balanced portfolio and avoid excessive exposure.
            </p>
          </div>
        </>
      )}
    </div>
  )
}

function MetricCard({ title, value, type = 'number', icon, trend }) {
  const trendColor = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-500',
    high: 'text-amber-600',
    low: 'text-green-600'
  }[trend]

  const trendIcon = {
    positive: <ArrowTrendingUpIcon className="h-4 w-4" />,
    negative: <ArrowTrendingDownIcon className="h-4 w-4" />,
    neutral: <div className="h-4 w-4"></div>,
    high: <ExclamationTriangleIcon className="h-4 w-4" />,
    low: <ShieldCheckIcon className="h-4 w-4" />
  }[trend]

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex justify-between items-start">
        <div className="text-sm font-medium text-gray-500">{title}</div>
        <div className={`p-1 rounded-full ${trendColor} bg-opacity-20`}>
          {trendIcon}
        </div>
      </div>
      <div className="mt-2 text-2xl font-semibold">
        {type === 'percent' ? `${(value * 100).toFixed(2)}%` : value.toFixed(2)}
      </div>
      <div className="mt-1 flex items-center text-xs">
        <span className={`mr-1 ${trendColor}`}>
          {trend === 'positive' && 'Low risk'}
          {trend === 'negative' && 'High risk'}
          {trend === 'neutral' && 'Neutral'}
          {trend === 'high' && 'Caution'}
          {trend === 'low' && 'Optimal'}
        </span>
      </div>
    </div>
  )
}