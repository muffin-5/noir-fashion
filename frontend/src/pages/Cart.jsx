import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { showToast } from '../components/Toast'

export default function Cart() {
  const { user, loading: authLoading } = useAuth()
  const { items, loading, count, subtotal, updateQty, remove } = useCart()

  if (authLoading) {
    return <div className="container"><div className="loading-wrap"><div className="spinner" /></div></div>
  }

  if (!user) {
    return (
      <div className="container empty">
        <h2 className="display">Your bag is private</h2>
        <p>Sign in to view your bag and continue shopping.</p>
        <Link to="/login" className="btn btn-solid">Sign In</Link>
      </div>
    )
  }

  return (
    <div>
      <div className="page-head">
        <span className="eyebrow">Your Selection</span>
        <h1 className="display">Shopping Bag</h1>
      </div>

      <div className="container">
        {loading ? (
          <div className="loading-wrap"><div className="spinner" /></div>
        ) : items.length === 0 ? (
          <div className="empty">
            <h2 className="display">Your bag is empty</h2>
            <p>Discover the collection and find a piece worth keeping.</p>
            <Link to="/products" className="btn btn-solid">Shop the Collection</Link>
          </div>
        ) : (
          <div className="cart-layout">
            <div>
              <span className="catalog-count">{count} item{count === 1 ? '' : 's'} in your bag</span>
              {items.map((item) => (
                <div className="cart-line" key={item.cart_id}>
                  <img src={item.product.image_url} alt={item.product.name} />
                  <div>
                    <h4>{item.product.name}</h4>
                    <div className="cat">{item.product.category}</div>
                    <div className="line-price">
                      &#8377;{Number(item.product.price).toLocaleString('en-IN')}
                    </div>
                    <button className="remove" onClick={() => remove(item.cart_id).then(() => showToast('Removed from bag'))}>
                      Remove
                    </button>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="qty" style={{ marginBottom: 0 }}>
                      <button onClick={() => updateQty(item.cart_id, item.quantity - 1)}>−</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQty(item.cart_id, item.quantity + 1)}>+</button>
                    </div>
                    <div style={{ marginTop: '0.6rem', fontWeight: 600 }}>
                      &#8377;{Number(item.subtotal).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <aside className="summary">
              <h3>Order Summary</h3>
              <div className="summary-row">
                <span>Subtotal ({count} item{count === 1 ? '' : 's'})</span>
                <span>&#8377;{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>{subtotal >= 2000 ? 'Free' : '₹149'}</span>
              </div>
              <div className="summary-total">
                <span>Total</span>
                <span>&#8377;{(subtotal + (subtotal >= 2000 ? 0 : 149)).toLocaleString('en-IN')}</span>
              </div>
              <div style={{ marginTop: '1.6rem' }}>
                <Link to="/checkout" className="btn btn-solid btn-block">Proceed to Checkout</Link>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  )
}