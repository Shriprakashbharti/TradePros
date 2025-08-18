import { useEffect, useState } from 'react'
import api from '../lib/api'

export default function Admin() {
  const [users, setUsers] = useState([])
  const [health, setHealth] = useState(null)
  useEffect(() => {
    (async () => {
      try { const { data: u } = await api.get('/api/admin/users'); setUsers(u) } catch {}
      try { const { data: h } = await api.get('/api/admin/health'); setHealth(h) } catch {}
    })()
  }, [])
  return (
    <div className="space-y-4">
      <div className="p-3 border rounded bg-white">
        <div className="font-semibold mb-2">System Health</div>
        <div className="text-sm">Status: {health?.status || 'unknown'} | Uptime: {health?.uptime?.toFixed?.(0) || '-' }s</div>
      </div>
      <div className="p-3 border rounded bg-white">
        <div className="font-semibold mb-2">Users</div>
        <table className="w-full text-sm">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Created</th></tr></thead>
          <tbody>
            {users.map((u)=>(
              <tr key={u._id}><td>{u.name}</td><td>{u.email}</td><td>{u.role}</td><td>{new Date(u.createdAt).toLocaleString()}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}


