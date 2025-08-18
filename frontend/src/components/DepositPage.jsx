import { useState } from 'react'
import { useAuth } from '../store/auth'
import api from '../lib/api'
import qrCodeImage from './unnamed.png';

export default function DepositPage() {
  const { user } = useAuth()
  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer')
  const [reference, setReference] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [showQR, setShowQR] = useState(false)

  // Mock payment details - replace with your actual payment info
  const paymentDetails = {
    upiId: 'yourbusiness@upi',
    accountNumber: '1234567890',
    accountName: 'Your Business Name',
    bankName: 'Your Bank Name',
    ifscCode: 'ABCD0123456',
    qrCodeImage: qrCodeImage // Replace with actual QR code image
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (paymentMethod === 'manual_deposit' && !reference) {
      setMessage({ 
        text: 'Please enter the payment reference ID',
        type: 'error'
      })
      return
    }

    setIsSubmitting(true)
    setMessage({ text: '', type: '' })

    try {
      const response = await api.post('/api/transactions/deposit', {
        userId: user.id,
        amount: parseFloat(amount),
        method: paymentMethod,
        reference,
        status: paymentMethod === 'manual_deposit' ? 'pending' : 'completed'
      })
      
      setMessage({ 
        text: paymentMethod === 'manual_deposit' 
          ? `Deposit request submitted! Transaction ID: ${response.data.transactionId}. Your funds will be credited after verification.`
          : `Deposit of $${amount} successful! Transaction ID: ${response.data.transactionId}`,
        type: 'success'
      })
      setAmount('')
      setReference('')
      setShowQR(false)
    } catch (error) {
      setMessage({ 
        text: error.response?.data?.message || 'Deposit failed. Please try again.',
        type: 'error'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleManualPaymentSelect = () => {
    setPaymentMethod('manual_deposit')
    setShowQR(true)
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Deposit Funds</h2>
      
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
          <p className="mt-1 text-xs text-gray-500">Minimum deposit: $10</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Method
          </label>
          <select
            value={paymentMethod}
            onChange={(e) => {
              setPaymentMethod(e.target.value)
              setShowQR(e.target.value === 'manual_deposit')
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="bank_transfer">Bank Transfer</option>
            <option value="manual_deposit">Manual Payment (UPI/QR)</option>
            <option value="other">Other</option>
          </select>
        </div>

        {paymentMethod === 'manual_deposit' && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
              <h3 className="font-medium text-gray-700 mb-3">Manual Payment Instructions</h3>
              
              {showQR && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Scan this QR code to make payment:</p>
                  <div className="flex justify-center">
                    <img 
                      src={paymentDetails.qrCodeImage} 
                      alt="Payment QR Code" 
                      className="w-48 h-48 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium text-gray-500">UPI ID:</p>
                  <p className="text-sm font-mono bg-gray-100 p-2 rounded">
                    {paymentDetails.upiId}
                    <button 
                      onClick={() => navigator.clipboard.writeText(paymentDetails.upiId)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      Copy
                    </button>
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Bank Details:</p>
                  <div className="text-sm bg-gray-100 p-2 rounded space-y-1">
                    <p>Account Name: {paymentDetails.accountName}</p>
                    <p>Account Number: {paymentDetails.accountNumber}</p>
                    <p>Bank: {paymentDetails.bankName}</p>
                    <p>IFSC: {paymentDetails.ifscCode}</p>
                  </div>
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  Please include your username as payment reference when sending money
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Reference/Transaction ID
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter UPI transaction ID or payment reference"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                This helps us verify your payment quickly
              </p>
            </div>
          </div>
        )}

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
          {isSubmitting ? 'Processing...' : 'Submit Deposit'}
        </button>
      </form>
    </div>
  )
}