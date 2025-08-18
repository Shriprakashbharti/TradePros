import { useState, useEffect } from 'react'
import api from '../lib/api'
import { useMarket } from '../store/market'
import { ArrowUpIcon, ArrowDownIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'

export default function OrderTicket() {
  const { instruments, symbol, tick } = useMarket()
  const [form, setForm] = useState({ 
    symbol, 
    side: 'BUY', 
    type: 'MARKET', 
    price: '', 
    qty: 1,
    tif: 'GTC' // Time in Force
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)
  const [lastPrice, setLastPrice] = useState(null)

  // Update last price when tick changes
  useEffect(() => {
    if (tick && tick.symbol === form.symbol) {
      setLastPrice(tick.last)
      if (form.type === 'MARKET') {
        setForm(prev => ({ ...prev, price: tick.last }))
      }
    }
  }, [tick, form.symbol, form.type])

  // Reset form when symbol changes
  useEffect(() => {
    setForm(prev => ({ 
      ...prev, 
      symbol,
      price: prev.type === 'LIMIT' ? prev.price : lastPrice || ''
    }))
  }, [symbol, lastPrice])

  const handleSubmit = async () => {
    if (!form.qty || (form.type === 'LIMIT' && !form.price)) {
      setSubmitStatus({ success: false, message: 'Please fill all required fields' })
      return
    }

    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      const payload = { 
        symbol: form.symbol, 
        side: form.side, 
        type: form.type, 
        qty: Number(form.qty),
      }
      
      if (form.type === 'LIMIT') {
        payload.price = Number(form.price)
      }

      await api.post('/api/orders', payload)
      setSubmitStatus({ success: true, message: 'Order submitted successfully' })
      // Reset form but keep side and type
      setForm(prev => ({ 
        ...prev, 
        qty: 1,
        price: prev.type === 'MARKET' ? lastPrice || '' : prev.price
      }))
    } catch (error) {
      setSubmitStatus({ 
        success: false, 
        message: error.response?.data?.message || 'Failed to submit order' 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleQuickQty = (percent) => {
    if (!lastPrice) return
    const maxQty = 1000 // This should come from available balance in a real app
    setForm(prev => ({ ...prev, qty: Math.floor(maxQty * percent) }))
  }

  return (
    <div className="border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h3 className="font-semibold text-gray-800">Order Ticket</h3>
      </div>
      
      <div className="p-4 space-y-4">
        {/* Symbol Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Symbol</label>
          <select 
            className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={form.symbol} 
            onChange={(e) => setForm({...form, symbol: e.target.value})}
          >
            {instruments.map((i) => (
              <option key={i.symbol} value={i.symbol}>{i.symbol}</option>
            ))}
          </select>
        </div>

        {/* Side Selection */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className={`flex items-center justify-center py-2 px-4 rounded-md ${form.side === 'BUY' ? 'bg-green-100 text-green-800 border-green-300' : 'bg-gray-100 text-gray-800 border-gray-300'} border`}
            onClick={() => setForm({...form, side: 'BUY'})}
          >
            <ArrowUpIcon className="h-5 w-5 mr-2" />
            Buy
          </button>
          <button
            type="button"
            className={`flex items-center justify-center py-2 px-4 rounded-md ${form.side === 'SELL' ? 'bg-red-100 text-red-800 border-red-300' : 'bg-gray-100 text-gray-800 border-gray-300'} border`}
            onClick={() => setForm({...form, side: 'SELL'})}
          >
            <ArrowDownIcon className="h-5 w-5 mr-2" />
            Sell
          </button>
        </div>

        {/* Order Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Order Type</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className={`py-2 px-4 rounded-md ${form.type === 'MARKET' ? 'bg-indigo-100 text-indigo-800 border-indigo-300' : 'bg-gray-100 text-gray-800 border-gray-300'} border`}
              onClick={() => setForm({...form, type: 'MARKET', price: lastPrice || ''})}
            >
              Market
            </button>
            <button
              type="button"
              className={`py-2 px-4 rounded-md ${form.type === 'LIMIT' ? 'bg-indigo-100 text-indigo-800 border-indigo-300' : 'bg-gray-100 text-gray-800 border-gray-300'} border`}
              onClick={() => setForm({...form, type: 'LIMIT'})}
            >
              Limit
            </button>
          </div>
        </div>

        {/* Price Input (for LIMIT orders) */}
        {form.type === 'LIMIT' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
            <div className="relative rounded-md shadow-sm">
              <input
                type="number"
                className="block w-full border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="0.00"
                value={form.price}
                onChange={(e) => setForm({...form, price: e.target.value})}
                step="0.01"
                min="0"
              />
              {lastPrice && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-sm">
                    Last: {lastPrice.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quantity Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
          <input
            type="number"
            className="block w-full border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="0"
            value={form.qty}
            onChange={(e) => setForm({...form, qty: e.target.value})}
            min="1"
            step="1"
          />
          <div className="flex space-x-2 mt-2">
            {[0.25, 0.5, 0.75, 1].map(percent => (
              <button
                key={percent}
                type="button"
                className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                onClick={() => handleQuickQty(percent)}
              >
                {percent * 100}%
              </button>
            ))}
          </div>
        </div>

        {/* Time in Force */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Time in Force</label>
          <select
            className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={form.tif}
            onChange={(e) => setForm({...form, tif: e.target.value})}
          >
            <option value="GTC">Good Till Cancel</option>
            <option value="IOC">Immediate or Cancel</option>
            <option value="FOK">Fill or Kill</option>
          </select>
        </div>

        {/* Submit Button */}
        <button
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${form.side === 'BUY' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 ${form.side === 'BUY' ? 'focus:ring-green-500' : 'focus:ring-red-500'}`}
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            'Submitting...'
          ) : (
            <>
              {form.side === 'BUY' ? 'Buy' : 'Sell'} {form.symbol}
              {form.type === 'LIMIT' && ` @ ${form.price || 'Limit'}`}
            </>
          )}
        </button>

        {/* Status Message */}
        {submitStatus && (
          <div className={`p-3 rounded-md ${submitStatus.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            <div className="flex items-center">
              {submitStatus.success ? (
                <CheckIcon className="h-5 w-5 mr-2 text-green-500" />
              ) : (
                <XMarkIcon className="h-5 w-5 mr-2 text-red-500" />
              )}
              <span>{submitStatus.message}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}