import { useState } from 'react'
import { useAuth } from '../store/auth'
import api from '../lib/api'

export default function WithdrawPage() {
  const { user } = useAuth()
  const [amount, setAmount] = useState('')
  const [withdrawMethod, setWithdrawMethod] = useState('bank_transfer')
  const [accountDetails, setAccountDetails] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage({ text: '', type: '' })

    try {
      const response = await api.post('/api/transactions/withdraw', {
        userId: user._id,
        amount: parseFloat(amount),
        method: withdrawMethod,
        accountDetails
      })
      
      setMessage({ 
        text: `Withdrawal request of $${amount} submitted! Transaction ID: ${response.data.transactionId}`,
        type: 'success'
      })
      setAmount('')
      setAccountDetails('')
    } catch (error) {
      setMessage({ 
        text: error.response?.data?.message || 'Withdrawal failed. Please try again.',
        type: 'error'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Withdraw Funds</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount (USD)
          </label>
          <input
            type="number"
            min="10"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <p className="mt-1 text-xs text-gray-500">Minimum withdrawal: $10</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Withdrawal Method
          </label>
          <select
            value={withdrawMethod}
            onChange={(e) => setWithdrawMethod(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="bank_transfer">Bank Transfer</option>
            <option value="crypto">UPI ID</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {withdrawMethod === 'bank_transfer' ? 'Bank Account Details' : 
             withdrawMethod === 'crypto' ? 'Wallet Address' : 'Payment Details'}
          </label>
          <textarea
            value={accountDetails}
            onChange={(e) => setAccountDetails(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            rows="3"
            required
          />
        </div>

        {message.text && (
          <div className={`p-3 rounded-md ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800' 
              : 'bg-red-50 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isSubmitting ? 'Processing...' : 'Request Withdrawal'}
        </button>
      </form>
    </div>
  )
}