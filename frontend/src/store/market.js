import { create } from 'zustand'
import { io } from 'socket.io-client'
import api from '../lib/api'

export const useMarket = create((set, get) => ({
  instruments: [],
  symbol: 'RELIANCE',
  candles: [],
  tick: null,
  orderbook: { bids: [], asks: [] },
  socket: null,
  
  async init() {
    try {
      const { data } = await api.get('/api/market/instruments')
      set({ instruments: data, symbol: data[0]?.symbol || 'RELIANCE' })
    } catch (error) {
      console.error('Failed to load instruments:', error)
    }
  },
  
  setSymbol: (symbol) => set({ symbol }),
  
 // In market.js - update loadCandles function
 async loadCandles(symbol, timeframe = '1m') {
  try {
    const { data } = await api.get('/api/market/candles', {
      
      params: {
        symbol: symbol.toUpperCase(),
        timeframe, // <-- backend must accept this
        limit: 100
      }
    })

    set({ candles: data })
  } catch (error) {
    console.error('Failed to load candles:', error)
    set({ candles: [] })
  }
},

  subscribeOrderbook: (symbol) => {
    const socket = get().socket
    if (socket) {
      socket.emit('market:subscribeOrderbook', { symbol })
    }
  },
  
  unsubscribeOrderbook: (symbol) => {
    const socket = get().socket
    if (socket) {
      socket.emit('market:unsubscribeOrderbook', { symbol })
    }
  },
  
  connect(symbol) {
    const token = localStorage.getItem('accessToken')
    const base = import.meta.env.VITE_WS_BASE || 'ws://localhost:5000'
    const socket = io(base + '/ws', { auth: { token } })
    
    socket.on('connect', () => {
      console.log('Connected to market data')
      socket.emit('market:subscribe', { symbol })
      socket.emit('market:subscribeOrderbook', { symbol }) // Add this
    })
    
    socket.on(`market:ticker:${symbol}`, (t) => set({ tick: t }))
    socket.on(`market:orderbook:${symbol}`, (ob) => set({ orderbook: ob }))
    
    socket.on('connect_error', (error) => {
      console.error('Connection error:', error)
    })
    
    set({ socket })
  },
  
  disconnect(symbol) {
    const socket = get().socket
    if (socket) {
      try { 
        socket.emit('market:unsubscribe', { symbol }) 
      } catch (error) {
        console.error('Error unsubscribing:', error)
      }
      socket.disconnect()
      set({ socket: null, tick: null, orderbook: { bids: [], asks: [] } })
    }
  }
}))

