import { useState, useEffect } from 'react'
import api from '../lib/api'
import { useMarket } from '../store/market'
import { ArrowUpIcon, ArrowDownIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../store/auth'

export default function OrderTicket() {
  const { instruments, symbol, tick } = useMarket()
  const { user } = useAuth()
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
    
    const qty = Number(form.qty)
    const actualBalance = user?.balance || 0
    
    if (form.side === 'BUY' && actualBalance < (lastPrice * qty)) {
      setSubmitStatus({ success: false, message: 'Not Enough Balance' })
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
        timeInForce: form.tif
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
    if (!lastPrice || !user?.balance) return
    
    if (form.side === 'BUY') {
      const maxQty = Math.floor(user.balance / lastPrice)
      setForm(prev => ({ ...prev, qty: Math.floor(maxQty * percent) }))
    } else {
      // For sell orders, you would use available holdings instead of balance
      setForm(prev => ({ ...prev, qty: Math.floor(prev.qty * percent) }))
    }
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
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-gray-500 text-sm">Last: {lastPrice}</span>
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
            className="block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={form.qty}
            onChange={(e) => setForm({...form, qty: e.target.value})}
            min="1"
          />
          
          {/* Quick Quantity Buttons */}
          <div className="grid grid-cols-4 gap-2 mt-2">
            {[0.25, 0.5, 0.75, 1].map((percent) => (
              <button
                key={percent}
                type="button"
                className="text-xs py-1 px-2 bg-gray-100 hover:bg-gray-200 rounded-md"
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
            <option value="GTC">Good Till Cancel (GTC)</option>
            <option value="IOC">Immediate or Cancel (IOC)</option>
            <option value="FOK">Fill or Kill (FOK)</option>
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`w-full py-3 px-4 rounded-md text-white font-medium ${
            form.side === 'BUY' 
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-red-600 hover:bg-red-700'
          } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            form.side === 'BUY' ? 'focus:ring-green-500' : 'focus:ring-red-500'
          } disabled:opacity-50`}
        >
          {isSubmitting ? 'Submitting...' : `${form.side} ${form.symbol}`}
        </button>

        {/* Status Message */}
        {submitStatus && (
          <div className={`p-3 rounded-md ${
            submitStatus.success 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            <div className="flex items-center">
              {submitStatus.success ? (
                <CheckIcon className="h-5 w-5 mr-2" />
              ) : (
                <XMarkIcon className="h-5 w-5 mr-2" />
              )}
              {submitStatus.message}
            </div>
          </div>
        )}

        {/* Order Summary */}
        <div className="text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Estimated Cost:</span>
            <span>₹{(lastPrice * form.qty).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Available Balance:</span>
            <span>₹{user?.balance?.toFixed(2) || '0.00'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}