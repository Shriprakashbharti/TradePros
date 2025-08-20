import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';

export default function Markets() {
  const [marketData, setMarketData] = useState([]);
  const [indexData, setIndexData] = useState({
    nifty50: { price: 0, change: 0, changePercent: 0 },
    sensex: { price: 0, change: 0, changePercent: 0 },
    niftyBank: { price: 0, change: 0, changePercent: 0 }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'symbol', direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMarketData();
    fetchIndexData();
    
    // Set up polling for real-time updates
    const marketInterval = setInterval(fetchMarketData, 15000); // Refresh every 15 seconds
    const indexInterval = setInterval(fetchIndexData, 30000); // Refresh indices every 30 seconds

    return () => {
      clearInterval(marketInterval);
      clearInterval(indexInterval);
    };
  }, []);

  const fetchMarketData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // In a real app, this would be an API call to your backend or direct to market data provider
      const response = await api.get('/api/marketapi/indian-stocks');
      setMarketData(response.data);
      
    } catch (error) {
      console.error('Error fetching market data:', error);
      setError('Failed to load market data');
      // Fallback to sample data
      setMarketData(getSampleMarketData());
    } finally {
      setIsLoading(false);
    }
  };

  const fetchIndexData = async () => {
    try {
      // Fetch Indian market indices
      const response = await api.get('/api/marketapi/indices');
      setIndexData(response.data);
    } catch (error) {
      console.error('Error fetching index data:', error);
      // Fallback data
      setIndexData({
        nifty50: { price: 21832.45, change: 156.78, changePercent: 0.72 },
        sensex: { price: 72102.31, change: 482.56, changePercent: 0.67 },
        niftyBank: { price: 46123.89, change: 321.45, changePercent: 0.70 }
      });
    }
  };

  const getSampleMarketData = () => [
    { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', price: 2856.75, change: 42.50, changePercent: 1.51, volume: 4567890, sector: 'Energy' },
    { symbol: 'TCS', name: 'Tata Consultancy Services Ltd', price: 4123.40, change: -23.60, changePercent: -0.57, volume: 2345678, sector: 'IT' },
    { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', price: 1645.30, change: 15.80, changePercent: 0.97, volume: 5678901, sector: 'Banking' },
    { symbol: 'INFY', name: 'Infosys Ltd', price: 1852.90, change: -8.45, changePercent: -0.45, volume: 3456789, sector: 'IT' },
    { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', price: 1098.65, change: 22.35, changePercent: 2.08, volume: 4789012, sector: 'Banking' },
    { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Ltd', price: 2456.80, change: -12.40, changePercent: -0.50, volume: 1234567, sector: 'FMCG' },
    { symbol: 'SBIN', name: 'State Bank of India', price: 765.45, change: 18.75, changePercent: 2.51, volume: 6789012, sector: 'Banking' },
    { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd', price: 1189.50, change: 32.25, changePercent: 2.79, volume: 3890123, sector: 'Telecom' },
    { symbol: 'ITC', name: 'ITC Ltd', price: 435.60, change: 5.40, changePercent: 1.26, volume: 2901234, sector: 'FMCG' },
    { symbol: 'BAJFINANCE', name: 'Bajaj Finance Ltd', price: 7258.35, change: -45.65, changePercent: -0.62, volume: 901234, sector: 'Financial Services' },
    { symbol: 'LT', name: 'Larsen & Toubro Ltd', price: 3567.90, change: 78.40, changePercent: 2.25, volume: 1567890, sector: 'Construction' },
    { symbol: 'HCLTECH', name: 'HCL Technologies Ltd', price: 1589.25, change: -12.75, changePercent: -0.80, volume: 1678901, sector: 'IT' },
    { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank Ltd', price: 1845.70, change: 25.30, changePercent: 1.39, volume: 1456789, sector: 'Banking' },
    { symbol: 'AXISBANK', name: 'Axis Bank Ltd', price: 1123.80, change: 18.90, changePercent: 1.71, volume: 2345678, sector: 'Banking' },
    { symbol: 'ASIANPAINT', name: 'Asian Paints Ltd', price: 3456.25, change: -23.45, changePercent: -0.67, volume: 890123, sector: 'Chemicals' },
    { symbol: 'MARUTI', name: 'Maruti Suzuki India Ltd', price: 9876.50, change: 123.40, changePercent: 1.27, volume: 567890, sector: 'Automobile' },
    { symbol: 'TITAN', name: 'Titan Company Ltd', price: 3210.75, change: 45.60, changePercent: 1.44, volume: 678901, sector: 'Retail' },
    { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical Industries Ltd', price: 1234.56, change: -12.34, changePercent: -0.99, volume: 789012, sector: 'Pharmaceuticals' },
    { symbol: 'NTPC', name: 'NTPC Ltd', price: 234.56, change: 3.45, changePercent: 1.49, volume: 3456789, sector: 'Power' },
    { symbol: 'ONGC', name: 'Oil and Natural Gas Corporation Ltd', price: 178.90, change: 2.30, changePercent: 1.30, volume: 4567890, sector: 'Energy' }
  ];

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedData = [...marketData].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const filteredData = sortedData.filter(stock => {
    const matchesFilter = filter === 'all' || stock.sector === filter;
    const matchesSearch = stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         stock.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const sectors = ['all', ...new Set(marketData.map(stock => stock.sector))];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-IN').format(value);
  };

  const formatPercentage = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getChangeColor = (value) => {
    return value >= 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Indian Markets</h1>
            <p className="text-gray-600 mt-2">Real-time stock market data from NSE & BSE</p>
          </div>
          <div className="mt-4 md:mt-0">
            <button
              onClick={fetchMarketData}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>
        </div>

        {/* Market Indices */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nifty 50</h3>
            <div className="flex items-baseline">
              <span className="text-2xl font-semibold">{formatCurrency(indexData.nifty50.price)}</span>
              <span className={`ml-2 text-sm font-medium ${getChangeColor(indexData.nifty50.change)}`}>
                {formatPercentage(indexData.nifty50.changePercent)}
              </span>
            </div>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Sensex</h3>
            <div className="flex items-baseline">
              <span className="text-2xl font-semibold">{formatCurrency(indexData.sensex.price)}</span>
              <span className={`ml-2 text-sm font-medium ${getChangeColor(indexData.sensex.change)}`}>
                {formatPercentage(indexData.sensex.changePercent)}
              </span>
            </div>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Bank Nifty</h3>
            <div className="flex items-baseline">
              <span className="text-2xl font-semibold">{formatCurrency(indexData.niftyBank.price)}</span>
              <span className={`ml-2 text-sm font-medium ${getChangeColor(indexData.niftyBank.change)}`}>
                {formatPercentage(indexData.niftyBank.changePercent)}
              </span>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex space-x-2 overflow-x-auto pb-2 md:pb-0">
              {sectors.map(sector => (
                <button
                  key={sector}
                  onClick={() => setFilter(sector)}
                  className={`px-3 py-1 text-sm font-medium rounded-full ${filter === sector 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {sector === 'all' ? 'All Sectors' : sector}
                </button>
              ))}
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search stocks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 w-full md:w-64"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Market Data Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Stocks</h2>
          </div>
          
          {error && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 m-4 rounded-md">
              <p className="text-yellow-800">{error}</p>
            </div>
          )}
          
          {isLoading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('symbol')}
                    >
                      Symbol {sortConfig.key === 'symbol' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('name')}
                    >
                      Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('price')}
                    >
                      Price {sortConfig.key === 'price' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('changePercent')}
                    >
                      Change % {sortConfig.key === 'changePercent' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('volume')}
                    >
                      Volume {sortConfig.key === 'volume' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('sector')}
                    >
                      Sector {sortConfig.key === 'sector' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.map((stock) => (
                    <tr key={stock.symbol} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {stock.symbol}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {stock.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                        {formatCurrency(stock.price)}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${getChangeColor(stock.change)}`}>
                        {formatPercentage(stock.changePercent)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                        {formatNumber(stock.volume)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                          {stock.sector}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          to={`/trading?symbol=${stock.symbol}`}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Trade
                        </Link>
                        <button className="text-gray-400 hover:text-gray-600">
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* API Integration Note */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Note:</strong> This page requires integration with a market data API. 
            For real implementation, you would connect to services like:
          </p>
          <ul className="text-sm text-blue-700 mt-2 list-disc list-inside">
            <li>NSE India API</li>
            <li>BSE India API</li>
            <li>Alpha Vantage</li>
            <li>Yahoo Finance API</li>
            <li>Twelve Data</li>
          </ul>
        </div>
      </div>
    </div>
  );
}