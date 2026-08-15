import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import client from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { user, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    client
      .get('/orders/')
      .then((res) => setOrders(res.data.results ?? res.data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [user])

  if (authLoading) {
    return <div className="container"><div className="loading-wrap"><div className="spinner" /></div></div>
  }

  if (!user) {
    return (
      <div className="container empty">
        <h2 className="display">Sign in to view orders</h2>
        <p>Your order history is tied to your account.</p>
        <Link to="/login" className="btn btn-solid">Sign In</Link>
      </div>
    )
  }

  return (
    <div>
      <div className="page-head">
        <span className="eyebrow">Account</span>
        <h1 className="display">Hello, {user.first_name || user.username}</h1>
      </div>

      <div className="container" style={{ paddingBottom: '5rem', maxWidth: '820px' }}>
        <div className="section-head" style={{ marginBottom: '2rem' }}>
          <div>
            <span className="eyebrow">Order History</span>
            <h2 className="display">Your Orders</h2>
          </div>
        </div>

        {loading ? (
          <div className="loading-wrap"><div className="spinner" /></div>
        ) : orders.length === 0 ? (
          <div className="empty" style={{ border: '1px solid rgba(24,21,17,0.1)' }}>
            <h2 className="display">No orders yet</h2>
            <p>Your future favourite pieces are waiting.</p>
            <Link to="/products" className="btn btn-solid">Shop the Collection</Link>
          </div>
        ) : (
          orders.map((order) => (
            <div className="order-card" key={order.order_id}>
              <div className="order-head">
                <span className="id">Order #{String(order.order_id).padStart(4, '0')}</span>
                <span className="date">
                  {new Date(order.placed_at).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
              {order.items.map((item) => (
                <div className="order-item" key={item.order_item_id}>
                  <img src={item.product.image_url} alt={item.product.name} />
                  <div>
                    <div className="name">{item.product.name}</div>
                    <div className="sub">
                      {item.product.category} · Qty {item.quantity}
                    </div>
                  </div>
                  <div className="amt">&#8377;{Number(item.subtotal).toLocaleString('en-IN')}</div>
                </div>
              ))}
              <div className="order-total">
                <span>Total</span>
                <span>&#8377;{Number(order.total_amount).toLocaleString('en-IN')}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}