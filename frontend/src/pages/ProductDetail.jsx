import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import client from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { showToast } from '../components/Toast'

function Stars({ rating }) {
  return <span className="review-stars">{'★'.repeat(rating)}{'☆'.repeat(5 - rating)}</span>
}

export default function ProductDetail() {
  const { pk } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { add } = useCart()
  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [qty, setQty] = useState(1)
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [reviewError, setReviewError] = useState('')
  const [reviewSending, setReviewSending] = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.all([client.get(`/products/${pk}/`), client.get(`/products/${pk}/reviews/`)])
      .then(([p, r]) => {
        setProduct(p.data)
        setReviews(r.data.results ?? r.data)
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false))
  }, [pk])

  if (loading) return <div className="container"><div className="loading-wrap"><div className="spinner" /></div></div>
  if (!product) {
    return (
      <div className="container empty">
        <h2 className="display">Product not found</h2>
        <button className="btn btn-outline" onClick={() => navigate('/products')}>Back to shop</button>
      </div>
    )
  }

  const handleAdd = async () => {
    if (!user) return navigate('/login')
    setAdding(true)
    try {
      await add(product.product_id, qty)
      showToast('Added to your bag')
    } catch (e) {
      showToast(e.response?.data?.detail || 'Could not add to bag')
    } finally {
      setAdding(false)
    }
  }

  const handleBuy = async () => {
    if (!user) return navigate('/login')
    setAdding(true)
    try {
      await add(product.product_id, qty)
      navigate('/checkout')
    } catch {
      showToast('Could not add to bag')
      setAdding(false)
    }
  }

  const submitReview = async (e) => {
    e.preventDefault()
    setReviewSending(true)
    setReviewError('')
    try {
      const { data } = await client.post(`/products/${pk}/reviews/`, { rating, comment })
      setReviews([data, ...reviews])
      setComment('')
      showToast('Thank you for your review')
    } catch (err) {
      setReviewError(err.response?.data?.detail || 'Please sign in to review.')
    } finally {
      setReviewSending(false)
    }
  }

  const inStock = product.stock_quantity > 0

  return (
    <div>
      <div className="container detail">
        <div className="detail-media">
          <img src={product.image_url} alt={product.name} />
        </div>
        <div className="detail-info fade-in">
          <span className="eyebrow">{product.category}</span>
          <h1 className="display">{product.name}</h1>
          <div className="detail-price">&#8377;{Number(product.price).toLocaleString('en-IN')}</div>
          <p className="detail-desc">{product.description}</p>

          <div className="detail-meta">
            <div>Availability<strong>{inStock ? 'In Stock' : 'Sold Out'}</strong></div>
            <div>Rating
              <strong>{product.average_rating ? `${product.average_rating} / 5` : '–'}</strong>
            </div>
            <div>SKU<strong>NOIR-{String(product.product_id).padStart(4, '0')}</strong></div>
          </div>

          <div className="qty">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
            <span>{qty}</span>
            <button onClick={() => setQty((q) => q + 1)}>+</button>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button className="btn btn-solid" onClick={handleBuy} disabled={adding || !inStock}>
              Buy Now
            </button>
            <button className="btn btn-outline" onClick={handleAdd} disabled={adding || !inStock}>
              Add to Bag
            </button>
          </div>
          {!inStock && <p className="stock-note">This piece is currently unavailable.</p>}
        </div>
      </div>

      <div className="container reviews">
        <div className="section-head">
          <div>
            <span className="eyebrow">Kind Words</span>
            <h2 className="display">Reviews</h2>
          </div>
        </div>

        {user && (
          <form onSubmit={submitReview} style={{ maxWidth: '560px' }}>
            {reviewError && <div className="form-error">{reviewError}</div>}
            <div className="field-grid">
              <div className="field">
                <label>Rating</label>
                <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>{n} star{n > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="field">
              <label>Your comment</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="How does it feel, fit and wear?"
                required
              />
            </div>
            <button className="btn btn-solid" type="submit" disabled={reviewSending}>
              Submit Review
            </button>
          </form>
        )}

        <div className="review-list">
          {reviews.length === 0 && (
            <p style={{ color: 'var(--taupe)' }}>No reviews yet{user ? '' : ' – sign in to be the first.'}</p>
          )}
          {reviews.map((r) => (
            <div className="review" key={r.review_id}>
              <div className="review-head">
                <span className="review-name">{r.customer_name}</span>
                <span className="review-date">{r.review_date}</span>
              </div>
              <Stars rating={r.rating} />
              <p className="review-comment">{r.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}