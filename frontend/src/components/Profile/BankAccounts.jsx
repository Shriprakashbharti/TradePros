import React, { useState } from 'react';
import api from '../../lib/api';

const BankAccounts = ({ bankAccounts, onUpdate }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [formData, setFormData] = useState({
    accountNumber: '',
    bankName: '',
    ifscCode: '',
    accountHolderName: '',
    isPrimary: false
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (editingAccount) {
        await api.put(`/api/profile/bank-accounts/${editingAccount._id}`, formData);
        setMessage('Bank account updated successfully!');
      } else {
        await api.post('/api/profile/bank-accounts', formData);
        setMessage('Bank account added successfully!');
      }
      
      resetForm();
      onUpdate();
    } catch (error) {
      setMessage('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setFormData({
      accountNumber: account.accountNumber,
      bankName: account.bankName,
      ifscCode: account.ifscCode,
      accountHolderName: account.accountHolderName,
      isPrimary: account.isPrimary
    });
    setShowForm(true);
  };

  const handleDelete = async (accountId) => {
    if (!window.confirm('Are you sure you want to delete this bank account?')) return;

    try {
      await api.delete(`/profile/bank-accounts/${accountId}`);
      setMessage('Bank account deleted successfully!');
      onUpdate();
    } catch (error) {
      setMessage('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const resetForm = () => {
    setFormData({
      accountNumber: '',
      bankName: '',
      ifscCode: '',
      accountHolderName: '',
      isPrimary: false
    });
    setEditingAccount(null);
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium">Bank Accounts</h3>
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Add Bank Account
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-md mb-6 ${
          message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
          {message}
        </div>
      )}

      {(showForm || editingAccount) && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
          <h4 className="text-lg font-medium mb-4">
            {editingAccount ? 'Edit Bank Account' : 'Add New Bank Account'}
          </h4>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Bank Name</label>
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Account Number</label>
                <input
                  type="text"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">IFSC Code</label>
                <input
                  type="text"
                  name="ifscCode"
                  value={formData.ifscCode}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., SBIN0000001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Account Holder Name</label>
                <input
                  type="text"
                  name="accountHolderName"
                  value={formData.accountHolderName}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isPrimary"
                  checked={formData.isPrimary}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">Set as primary account</span>
              </label>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : (editingAccount ? 'Update' : 'Add')} Account
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {bankAccounts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No bank accounts added yet.
          </div>
        ) : (
          bankAccounts.map((account) => (
            <div key={account._id} className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-lg">
                    {account.bankName}
                    {account.isPrimary && (
                      <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        Primary
                      </span>
                    )}
                  </h4>
                  <p className="text-gray-600">Account: ••••{account.accountNumber.slice(-4)}</p>
                  <p className="text-gray-600">IFSC: {account.ifscCode}</p>
                  <p className="text-gray-600">Holder: {account.accountHolderName}</p>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(account)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(account._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BankAccounts;