import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import client from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { getErrorMessage } from '../api/client'
import { showToast } from '../components/Toast'

export default function Checkout() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const { items, loading, count, subtotal, clear } = useCart()
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone_no: '',
    shipping_address: '',
  })

  if (authLoading) {
    return <div className="container"><div className="loading-wrap"><div className="spinner" /></div></div>
  }

  if (!user) {
    return (
      <div className="container empty">
        <h2 className="display">Sign in to check out</h2>
        <p>You need an account to place an order.</p>
        <Link to="/login" className="btn btn-solid">Sign In</Link>
      </div>
    )
  }

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const placeOrder = async (e) => {
    e.preventDefault()
    setPlacing(true)
    setError('')
    try {
      await client.post('/orders/checkout/', form)
      clear()
      showToast('Order placed successfully')
      navigate('/profile')
    } catch (err) {
      setError(getErrorMessage(err, 'Could not place your order.'))
    } finally {
      setPlacing(false)
    }
  }

  return (
    <div>
      <div className="page-head">
        <span className="eyebrow">Almost There</span>
        <h1 className="display">Checkout</h1>
      </div>
      <div className="container cart-layout">
        {loading ? (
          <div className="loading-wrap"><div className="spinner" /></div>
        ) : items.length === 0 ? (
          <div className="empty">
            <h2 className="display">Nothing to check out</h2>
            <p>Your bag is empty. Add a piece you love.</p>
            <Link to="/products" className="btn btn-solid">Shop the Collection</Link>
          </div>
        ) : (
          <>
            <form onSubmit={placeOrder} className="form" style={{ margin: 0, maxWidth: 'none' }}>
              {error && <div className="form-error">{error}</div>}
              <div className="field-grid">
                <div className="field">
                  <label>First name</label>
                  <input value={form.first_name} onChange={set('first_name')} required />
                </div>
                <div className="field">
                  <label>Last name</label>
                  <input value={form.last_name} onChange={set('last_name')} required />
                </div>
              </div>
              <div className="field-grid">
                <div className="field">
                  <label>Email</label>
                  <input type="email" value={form.email} onChange={set('email')} required />
                </div>
                <div className="field">
                  <label>Phone</label>
                  <input type="number" value={form.phone_no} onChange={set('phone_no')} required />
                </div>
              </div>
              <div className="field">
                <label>Shipping address</label>
                <textarea value={form.shipping_address} onChange={set('shipping_address')} required />
              </div>
              <button className="btn btn-solid btn-block" disabled={placing}>
                {placing ? 'Placing order…' : `Place Order · &#8377;${(subtotal + (subtotal >= 2000 ? 0 : 149)).toLocaleString('en-IN')}`}
              </button>
            </form>

            <aside className="summary">
              <h3>Your Order</h3>
              {items.map((item) => (
                <div className="summary-row" key={item.cart_id}>
                  <span>{item.product.name} × {item.quantity}</span>
                  <span>&#8377;{Number(item.subtotal).toLocaleString('en-IN')}</span>
                </div>
              ))}
              <div className="summary-row">
                <span>Shipping</span>
                <span>{subtotal >= 2000 ? 'Free' : '&#8377;149'}</span>
              </div>
              <div className="summary-total">
                <span>Total ({count} item{count === 1 ? '' : 's'})</span>
                <span>&#8377;{(subtotal + (subtotal >= 2000 ? 0 : 149)).toLocaleString('en-IN')}</span>
              </div>
            </aside>
          </>
        )}
      </div>
    </div>
  )
}