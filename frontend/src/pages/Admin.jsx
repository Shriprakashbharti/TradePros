import { useEffect, useState } from 'react'
import api from '../lib/api'

export default function Admin() {
  const [users, setUsers] = useState([])
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState({
    users: true,
    health: true
  })
  const [error, setError] = useState({
    users: null,
    health: null
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: u } = await api.get('/api/admin/users')
        setUsers(u)
      } catch (err) {
        setError(prev => ({...prev, users: err.message || 'Failed to fetch users'}))
      } finally {
        setLoading(prev => ({...prev, users: false}))
      }

      try {
        const { data: h } = await api.get('/api/admin/health')
        setHealth(h)
      } catch (err) {
        setError(prev => ({...prev, health: err.message || 'Failed to fetch system health'}))
      } finally {
        setLoading(prev => ({...prev, health: false}))
      }
    }

    fetchData()
  }, [])

  const formatUptime = (seconds) => {
    if (!seconds) return '-'
    const days = Math.floor(seconds / (3600 * 24))
    const hours = Math.floor((seconds % (3600 * 24)) / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    
    return `${days}d ${hours}h ${mins}m ${secs}s`
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
      
      {/* System Health Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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
                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${health?.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span className="text-lg font-semibold capitalize">{health?.status || 'unknown'}</span>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-500">Uptime</div>
                <div className="mt-1 text-lg font-semibold">{formatUptime(health?.uptime)}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-500">Version</div>
                <div className="mt-1 text-lg font-semibold">{health?.version || '-'}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Users Table Card */}
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
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}