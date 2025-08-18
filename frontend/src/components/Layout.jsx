import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../store/auth'

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex bg-gray-100">
      <aside className="w-56 bg-white border-r p-4">
        <div className="font-bold text-xl mb-4">Trading</div>
        <nav className="space-y-2">
          <NavLink to="/dashboard" className={({isActive}) => `block px-2 py-1 rounded ${isActive? 'bg-gray-200':''}`}>Dashboard</NavLink>
          <NavLink to="/trading" className={({isActive}) => `block px-2 py-1 rounded ${isActive? 'bg-gray-200':''}`}>Trading</NavLink>
          <NavLink to="/orders" className={({isActive}) => `block px-2 py-1 rounded ${isActive? 'bg-gray-200':''}`}>Orders</NavLink>
          <NavLink to="/portfolio" className={({isActive}) => `block px-2 py-1 rounded ${isActive? 'bg-gray-200':''}`}>Portfolio</NavLink>
          <NavLink to="/risk" className={({isActive}) => `block px-2 py-1 rounded ${isActive? 'bg-gray-200':''}`}>Risk</NavLink>
          {user?.role === 'admin' && (
            <NavLink to="/admin" className={({isActive}) => `block px-2 py-1 rounded ${isActive? 'bg-gray-200':''}`}>Admin</NavLink>
          )}
        </nav>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="h-14 flex items-center justify-between px-4 border-b bg-white">
          <div className="font-semibold">Dev Demo</div>
          <div>
            {user ? (
              <div className="flex items-center gap-3">
                <span>{user.name} ({user.role})</span>
                <button className="px-3 py-1 border rounded" onClick={()=>{ logout(); navigate('/login') }}>Logout</button>
              </div>
            ) : (
              <div className="space-x-2">
                <Link to="/login" className="px-3 py-1 border rounded">Login</Link>
                <Link to="/register" className="px-3 py-1 border rounded">Register</Link>
              </div>
            )}
          </div>
        </header>
        <main className="p-4 flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}


