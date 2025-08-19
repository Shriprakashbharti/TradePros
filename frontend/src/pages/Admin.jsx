import { useEffect, useState } from 'react';
import api from '../lib/api';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [health, setHealth] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: 'user',
    balance: 0,
    isActive: true
  });
  const [loading, setLoading] = useState({
    users: true,
    transactions: true,
    orders: true,
    stats: true,
    health: true,
    actions: false
  });
  const [error, setError] = useState({
    users: null,
    transactions: null,
    orders: null,
    stats: null,
    health: null,
    actions: null
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [usersRes, statsRes, healthRes] = await Promise.all([
        api.get('/api/admin/users'),
        api.get('/api/admin/stats'),
        api.get('/api/admin/health')
      ]);
      
      setUsers(usersRes.data.users || usersRes.data);
      setStats(statsRes.data);
      setHealth(healthRes.data);
      
      setLoading(prev => ({ ...prev, users: false, stats: false, health: false }));
    } catch (err) {
      setError(prev => ({
        ...prev,
        users: err.message || 'Failed to fetch users',
        stats: err.message || 'Failed to fetch stats',
        health: err.message || 'Failed to fetch health'
      }));
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/api/admin/transactions');
      setTransactions(response.data.transactions || response.data);
      setLoading(prev => ({ ...prev, transactions: false }));
    } catch (err) {
      setError(prev => ({ ...prev, transactions: err.message || 'Failed to fetch transactions' }));
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await api.get('/api/admin/orders');
      setOrders(response.data.orders || response.data);
      setLoading(prev => ({ ...prev, orders: false }));
    } catch (err) {
      setError(prev => ({ ...prev, orders: err.message || 'Failed to fetch orders' }));
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      balance: user.balance,
      isActive: user.isActive
    });
    setIsEditModalOpen(true);
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const handleSaveUser = async () => {
    try {
      setLoading(prev => ({ ...prev, actions: true }));
      await api.put(`/api/admin/users/${selectedUser._id}`, editForm);
      setIsEditModalOpen(false);
      fetchDashboardData();
      alert('User updated successfully!');
    } catch (err) {
      setError(prev => ({ ...prev, actions: err.message || 'Failed to update user' }));
    } finally {
      setLoading(prev => ({ ...prev, actions: false }));
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      setLoading(prev => ({ ...prev, actions: true }));
      await api.put(`/api/admin/users/${userId}`, { isActive: !currentStatus });
      fetchDashboardData();
      alert(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
    } catch (err) {
      setError(prev => ({ ...prev, actions: err.message || 'Failed to update user status' }));
    } finally {
      setLoading(prev => ({ ...prev, actions: false }));
    }
  };

  const handleResetPassword = async (userId) => {
    if (!confirm('Are you sure you want to reset this user\'s password? They will need to set a new password on next login.')) {
      return;
    }

    try {
      setLoading(prev => ({ ...prev, actions: true }));
      await api.post(`/api/admin/users/${userId}/reset-password`);
      alert('Password reset email sent successfully!');
    } catch (err) {
      setError(prev => ({ ...prev, actions: err.message || 'Failed to reset password' }));
    } finally {
      setLoading(prev => ({ ...prev, actions: false }));
    }
  };

  const handleAddBalance = async (userId, amount) => {
    const addAmount = parseFloat(prompt('Enter amount to add:', '0'));
    if (isNaN(addAmount) || addAmount <= 0) return;

    try {
      setLoading(prev => ({ ...prev, actions: true }));
      await api.post(`/api/admin/users/${userId}/balance`, { amount: addAmount });
      fetchDashboardData();
      alert(`Added ${formatCurrency(addAmount)} to user balance!`);
    } catch (err) {
      setError(prev => ({ ...prev, actions: err.message || 'Failed to add balance' }));
    } finally {
      setLoading(prev => ({ ...prev, actions: false }));
    }
  };

  const handleApproveTransaction = async (transactionId, type) => {
    try {
      const endpoint = type === 'deposit' 
        ? `/api/admin/transactions/${transactionId}/approve-deposit`
        : `/api/admin/transactions/${transactionId}/approve-withdrawal`;
      
      await api.post(endpoint);
      fetchTransactions();
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve transaction');
    }
  };

  const handleRejectTransaction = async (transactionId) => {
    try {
      await api.post(`/api/admin/transactions/${transactionId}/reject`);
      fetchTransactions();
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject transaction');
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      await api.post(`/api/admin/orders/${orderId}/cancel`);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel order');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatUptime = (seconds) => {
    if (!seconds) return '-';
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    return `${days}d ${hours}h ${mins}m ${secs}s`;
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm font-medium text-gray-500">Total Users</div>
          <div className="mt-1 text-3xl font-semibold text-gray-900">
            {stats?.users || 0}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm font-medium text-gray-500">Pending Deposits</div>
          <div className="mt-1 text-3xl font-semibold text-yellow-600">
            {stats?.pendingDeposits || 0}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm font-medium text-gray-500">Pending Withdrawals</div>
          <div className="mt-1 text-3xl font-semibold text-yellow-600">
            {stats?.pendingWithdrawals || 0}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm font-medium text-gray-500">Total Balance</div>
          <div className="mt-1 text-3xl font-semibold text-green-600">
            {formatCurrency(stats?.totalBalance || 0)}
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">System Health</h2>
        </div>
        <div className="p-6">
          {loading.health ? (
            <div className="flex items-center space-x-2 text-gray-500">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin"></div>
              <span>Loading system health...</span>
            </div>
          ) : error.health ? (
            <div className="text-red-500">{error.health}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-500">Status</div>
                <div className="mt-1 flex items-center">
                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${health?.status === 'ok' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span className="text-lg font-semibold capitalize">{health?.status || 'unknown'}</span>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-500">Uptime</div>
                <div className="mt-1 text-lg font-semibold">{formatUptime(health?.uptime)}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-500">Open Orders</div>
                <div className="mt-1 text-lg font-semibold">{stats?.openOrders || 0}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

 const renderUserActions = (user) => (
    <div className="flex space-x-2">
      <button
        onClick={() => handleViewUser(user)}
        className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
        title="View Details"
      >
        👁️
      </button>
      <button
        onClick={() => handleEditUser(user)}
        className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
        title="Edit User"
      >
        ✏️
      </button>
      <button
        onClick={() => handleToggleUserStatus(user._id, user.isActive)}
        className={`px-3 py-1 text-xs rounded ${
          user.isActive
            ? 'bg-red-100 text-red-700 hover:bg-red-200'
            : 'bg-green-100 text-green-700 hover:bg-green-200'
        }`}
        title={user.isActive ? 'Deactivate' : 'Activate'}
      >
        {user.isActive ? '⏸️' : '▶️'}
      </button>
      <button
        onClick={() => handleResetPassword(user._id)}
        className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
        title="Reset Password"
      >
        🔑
      </button>
      <button
        onClick={() => handleAddBalance(user._id)}
        className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
        title="Add Balance"
      >
        💰
      </button>
    </div>
  );

  const renderUsers = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">User Management</h2>
        <span className="text-sm text-gray-500">{users.length} users</span>
      </div>
      <div className="overflow-x-auto">
        {loading.users ? (
          <div className="p-6 flex items-center justify-center">
            <div className="flex items-center space-x-2 text-gray-500">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin"></div>
              <span>Loading users...</span>
            </div>
          </div>
        ) : error.users ? (
          <div className="p-6 text-red-500">{error.users}</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">
                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(user.balance || 0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      user.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {renderUserActions(user)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit User Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Edit User</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Balance</label>
                <input
                  type="number"
                  value={editForm.balance}
                  onChange={(e) => setEditForm({...editForm, balance: parseFloat(e.target.value)})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={editForm.isActive}
                  onChange={(e) => setEditForm({...editForm, isActive: e.target.checked})}
                  className="mr-2"
                />
                <label className="text-sm font-medium text-gray-700">Active</label>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUser}
                disabled={loading.actions}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md disabled:opacity-50"
              >
                {loading.actions ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {isViewModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">User Details</h2>
            <div className="space-y-3">
              <div>
                <strong>Name:</strong> {selectedUser.name}
              </div>
              <div>
                <strong>Email:</strong> {selectedUser.email}
              </div>
              <div>
                <strong>Role:</strong> {selectedUser.role}
              </div>
              <div>
                <strong>Balance:</strong> {formatCurrency(selectedUser.balance || 0)}
              </div>
              <div>
                <strong>Status:</strong> {selectedUser.isActive ? 'Active' : 'Inactive'}
              </div>
              <div>
                <strong>Joined:</strong> {new Date(selectedUser.createdAt).toLocaleString()}
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  
  const renderTransactions = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Transactions</h2>
        <button 
          onClick={fetchTransactions}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Refresh
        </button>
      </div>
      <div className="overflow-x-auto">
        {loading.transactions ? (
          <div className="p-6 flex items-center justify-center">
            <div className="flex items-center space-x-2 text-gray-500">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin"></div>
              <span>Loading transactions...</span>
            </div>
          </div>
        ) : error.transactions ? (
          <div className="p-6 text-red-500">{error.transactions}</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Referance Id</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {transaction.userId?.name || 'Unknown'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {transaction.userId?.email || ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      transaction.type === 'deposit' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(transaction.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.method}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.reference}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      transaction.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : transaction.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(transaction.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {transaction.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApproveTransaction(transaction._id, transaction.type)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectTransaction(transaction._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Orders</h2>
        <button 
          onClick={fetchOrders}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Refresh
        </button>
      </div>
      <div className="overflow-x-auto">
        {loading.orders ? (
          <div className="p-6 flex items-center justify-center">
            <div className="flex items-center space-x-2 text-gray-500">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin"></div>
              <span>Loading orders...</span>
            </div>
          </div>
        ) : error.orders ? (
          <div className="p-6 text-red-500">{error.orders}</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Symbol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Side</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {order.user?.name || 'Unknown'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.user?.email || ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.symbol}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      order.side === 'BUY' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {order.side}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.qty}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.price ? formatCurrency(order.price) : 'MARKET'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      order.status === 'FILLED' 
                        ? 'bg-green-100 text-green-800' 
                        : order.status === 'OPEN'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {(order.status === 'OPEN' || order.status === 'PARTIAL') && (
                      <button
                        onClick={() => handleCancelOrder(order._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
      
      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['dashboard', 'users', 'transactions', 'orders'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`${
                activeTab === tab
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Content Area */}
      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'users' && renderUsers()}
      {activeTab === 'transactions' && renderTransactions()}
      {activeTab === 'orders' && renderOrders()}
    </div>
  );
}