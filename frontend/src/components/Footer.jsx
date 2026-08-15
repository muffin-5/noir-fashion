import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">NOIR</div>
            <p className="footer-tag">
              Quiet confidence, contemporary grace. Every collection is a study in
              balance – heritage and modernity.
            </p>
          </div>
          <div>
            <h5>Shop</h5>
            <Link to="/products">All Products</Link>
            <Link to="/cart">Your Cart</Link>
            <Link to="/profile">Order History</Link>
          </div>
          <div>
            <h5>Account</h5>
            <Link to="/login">Sign In</Link>
            <Link to="/signup">Create Account</Link>
          </div>
          <div>
            <h5>Atelier</h5>
            <span className="eyebrow" style={{ color: 'var(--bone)' }}>Varanasi, IN</span>
            <p style={{ marginTop: '1rem', color: 'var(--stone)', fontSize: '0.85rem' }}>
              hello@noir.studio
            </p>
          </div>
        </div>
        <div className="footer-bottom">
          <span>&copy; 2026 NOIR Studio &amp; Atelier</span>
          <span>Django REST &middot; React &middot; SQLite</span>
        </div>
      </div>
    </footer>
  )
}