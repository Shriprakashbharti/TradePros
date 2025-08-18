import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../store/auth'

export default function Login() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'
  return (
    <div className="min-h-screen grid place-items-center bg-gray-100">
      <div className="w-full max-w-sm p-6 border rounded bg-white">
        <div className="text-xl font-semibold mb-4">Login</div>
        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
        <input className="border p-2 rounded w-full mb-2" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
        <input type="password" className="border p-2 rounded w-full mb-2" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} />
        <button className="w-full bg-blue-600 text-white py-2 rounded" onClick={async ()=>{
          try { await login(email, password); navigate(from, { replace: true }) } catch(e){ setError(e.response?.data?.message || 'Login failed') }
        }}>Login</button>
        <div className="text-sm mt-2">No account? <Link className="text-blue-600" to="/register">Register</Link></div>
      </div>
    </div>
  )
}


