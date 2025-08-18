import { create } from 'zustand'
import { io } from 'socket.io-client'
import api from '../lib/api'

export const useMarket = create((set, get) => ({
  instruments: [],
  symbol: 'AAPL',
  candles: [],
  tick: null,
  orderbook: { bids: [], asks: [] },
  socket: null,
  async init() {
    const { data } = await api.get('/api/market/instruments')
    set({ instruments: data, symbol: data[0]?.symbol || 'AAPL' })
  },
  async loadCandles(symbol) {
    const { data } = await api.get('/api/market/candles', { params: { symbol, limit: 100 } })
    set({ candles: data })
  },
  connect(symbol) {
    const token = localStorage.getItem('accessToken')
    const base = import.meta.env.VITE_WS_BASE || 'ws://localhost:5000'
    const socket = io(base + '/ws', { auth: { token } })
    socket.on(`market:ticker:${symbol}`, (t) => set({ tick: t }))
    socket.on(`market:orderbook:${symbol}`, (ob) => set({ orderbook: ob }))
    socket.emit('market:subscribe', { symbol })
    set({ socket })
  },
  disconnect(symbol) {
    const socket = get().socket
    if (socket) {
      try { socket.emit('market:unsubscribe', { symbol }) } catch {}
      socket.disconnect()
      set({ socket: null })
    }
  }
}))


