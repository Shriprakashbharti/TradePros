import { create } from 'zustand'
import api from '../lib/api'

export const useAuth = create((set) => ({
  user: null,
  loading: false,
  async login(email, password) {
    set({ loading: true })
    const { data } = await api.post('/api/auth/login', { email, password })
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    set({ user: data.user, loading: false })
  },
  async register(name, email, password) {
    set({ loading: true })
    const { data } = await api.post('/api/auth/register', { name, email, password })
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    set({ user: data.user, loading: false })
  },
  async loadMe() {
    try { const { data } = await api.get('/api/auth/me'); set({ user: data }) } catch {}
  },
  logout() { localStorage.removeItem('accessToken'); localStorage.removeItem('refreshToken'); set({ user: null }) }
}))


