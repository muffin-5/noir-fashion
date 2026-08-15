import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import client from '../api/client'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchCart = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await client.get('/cart/')
      setItems(data.results ?? data)
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user) {
      fetchCart()
    } else {
      setItems([])
    }
  }, [user, fetchCart])

  const add = useCallback(
    async (productId, quantity = 1) => {
      await client.post('/cart/', { product_id: productId, quantity })
      await fetchCart()
    },
    [fetchCart]
  )

  const updateQty = useCallback(
    async (cartId, quantity) => {
      await client.patch(`/cart/${cartId}/`, { quantity })
      await fetchCart()
    },
    [fetchCart]
  )

  const remove = useCallback(
    async (cartId) => {
      await client.delete(`/cart/${cartId}/`)
      await fetchCart()
    },
    [fetchCart]
  )

  const clear = useCallback(() => setItems([]), [])

  const subtotal = items.reduce((sum, item) => sum + Number(item.subtotal), 0)
  const count = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider value={{ items, loading, count, subtotal, add, updateQty, remove, clear, fetchCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}