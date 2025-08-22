import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Layout from '../components/Layout'
import Dashboard from './Dashboard'
import Trading from './Trading'
import Orders from './Orders'
import Portfolio from './Portfolio'
import Risk from './Risk'
import Login from './Login'
import Register from './Register'
import Admin from './Admin'
import { useAuth } from '../store/auth'
import { useEffect } from 'react'
import DepositPage from '../components/DepositPage'
import WithdrawPage from '../components/WithdrawPage'
import Markets from './Market'
import Profile from '../pages/Profile';

function Protected({ children, role }) {
  const { user, loadMe } = useAuth()
  const location = useLocation()
  useEffect(() => { if (!user) loadMe() }, [])
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  if (role && user.role !== role) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Protected><Layout><Dashboard /></Layout></Protected>} />
      <Route path="/trading" element={<Protected><Layout><Trading /></Layout></Protected>} />
      <Route path="/orders" element={<Protected><Layout><Orders /></Layout></Protected>} />
      <Route path="/withdraw" element={<Protected><Layout><WithdrawPage /></Layout></Protected>} />
      <Route path="/deposit" element={<Protected><Layout><DepositPage /></Layout></Protected>} />
      <Route path="/portfolio" element={<Protected><Layout><Portfolio /></Layout></Protected>} />
      <Route path='/markets' element={<Protected><Layout><Markets/></Layout></Protected>}/>
      <Route path="/profile" element={<Protected><Layout><Profile /></Layout></Protected>} />
      <Route path="/risk" element={<Protected><Layout><Risk /></Layout></Protected>} /> 
      <Route path="/admin" element={<Protected role="admin"><Layout><Admin /></Layout></Protected>} />
    </Routes>
  )
}


