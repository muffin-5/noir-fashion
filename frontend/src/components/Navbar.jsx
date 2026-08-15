import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { count } = useCart()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <>
      <div className="announce">Free shipping on orders over &#8377;2,000 &middot; The Autumn &mdash; Winter Collection 2026</div>
      <header className="nav">
        <div className="container nav-inner">
          <Link to="/" className="nav-brand">NOIR</Link>
          <nav>
            <ul className={`nav-links ${open ? 'open' : ''}`}>
              <li><NavLink to="/" end onClick={() => setOpen(false)}>Home</NavLink></li>
              <li><NavLink to="/products" onClick={() => setOpen(false)}>Shop</NavLink></li>
              <li><NavLink to="/profile" onClick={() => setOpen(false)}>Orders</NavLink></li>
            </ul>
          </nav>
          <div className="nav-actions">
            {user ? (
              <>
                <span className="eyebrow" style={{ color: 'var(--ink)' }}>{user.first_name || user.username}</span>
                <button className="btn-ghost eyebrow" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <Link to="/login" className="btn-ghost eyebrow">Sign in</Link>
            )}
            <Link to="/cart" className="nav-icon" aria-label="Cart">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path d="M6 6h15l-1.5 9h-12z" strokeLinejoin="round" />
                <path d="M6 6L4.5 3H2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="9" cy="20" r="1.4" />
                <circle cx="18" cy="20" r="1.4" />
              </svg>
              {count > 0 && <span className="nav-badge">{count}</span>}
            </Link>
            <button className="menu-toggle" onClick={() => setOpen((o) => !o)} aria-label="Menu">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                <path d="M3 6h18M3 12h18M3 18h12" />
              </svg>
            </button>
          </div>
        </div>
      </header>
    </>
  )
}