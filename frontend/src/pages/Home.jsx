import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import client from '../api/client'
import ProductCard from '../components/ProductCard'

export default function Home() {
  const [featured, setFeatured] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([client.get('/products/?ordering=price'), client.get('/categories/')])
      .then(([p, c]) => {
        setFeatured(p.data.results ?? p.data)
        setCategories(c.data.results ?? c.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const firstCat = categories.slice(0, 3)

  return (
    <div>
      <section className="container hero">
        <div className="hero-copy fade-in">
          <span className="eyebrow">Studio &amp; Atelier &mdash; Est. 2026</span>
          <h1 className="display">Modest wear,<br />reimagined.</h1>
          <p>
            Every collection is a study in balance – heritage and modernity,
            subtlety and boldness – designed for those who define elegance on
            their own terms.
          </p>
          <div className="hero-cta">
            <Link to="/products" className="btn btn-solid">Explore Collection</Link>
            <Link to="/products" className="btn btn-outline">Shop New Arrivals</Link>
          </div>
        </div>
        <div className="hero-image">
          <img src="/static/images/c1.jpg" alt="NOIR editorial lookbook" />
        </div>
      </section>

      <div className="marquee">
        <div className="marquee-track">
          <span>Free shipping over &#8377;2,000</span><span>Autumn &mdash; Winter 2026</span>
          <span>Handpicked pieces</span><span>Quiet luxury</span>
          <span>Free shipping over &#8377;2,000</span><span>Autumn &mdash; Winter 2026</span>
          <span>Handpicked pieces</span><span>Quiet luxury</span>
        </div>
      </div>

      <section className="section container">
        <div className="section-head">
          <div>
            <span className="eyebrow">The Edit</span>
            <h2 className="display">Featured Pieces</h2>
          </div>
          <Link to="/products" className="section-link">View all</Link>
        </div>
        {loading ? (
          <div className="loading-wrap"><div className="spinner" /></div>
        ) : (
          <div className="grid">
            {featured.slice(0, 6).map((p) => (
              <ProductCard key={p.product_id} product={p} />
            ))}
          </div>
        )}
      </section>

      <section className="section container">
        <div className="split">
          <div className="split-media">
            <img src="/static/images/c2.jpg" alt="NOIR atelier" />
          </div>
          <div className="split-copy">
            <span className="eyebrow">The Philosophy</span>
            <h2 className="display">A study in balance.</h2>
            <p>
              We believe in garments that ask little and give much. Natural
              fabrics, considered silhouettes and a palette drawn from earth and
              ash – pieces meant to be lived in, layered and passed on.
            </p>
            <Link to="/products" className="btn btn-solid">Discover the Collection</Link>
          </div>
        </div>
      </section>

      <section className="section container">
        <div className="section-head">
          <div>
            <span className="eyebrow">Browse</span>
            <h2 className="display">Shop by Category</h2>
          </div>
        </div>
        <div className="grid">
          {firstCat.map((c) => (
            <Link key={c.category_id} to={`/products?category=${c.category_id}`} className="card">
              <div className="card-media">
                <img
                  src={
                    c.category_id === 7 ? '/media/products_img/jeans1_A1kxzWe.jpg'
                    : c.category_id === 6 ? '/media/products_img/tshirt.jpg'
                    : c.category_id === 3 ? '/media/products_img/jacket_NKBH1KO.jpg'
                    : c.category_id === 2 ? '/media/products_img/socks_HLb4HUn.jpg'
                    : c.category_id === 4 ? '/media/products_img/titan_6y9aFxO.jpg'
                    : c.category_id === 5 ? '/media/products_img/belt_0tMW7WV.jpeg'
                    : c.category_id === 8 ? '/media/products_img/shirt1_54leg60.jpg'
                    : '/media/products_img/shoes_GAEMSzJ.jpg'
                  }
                  alt={c.name}
                />
              </div>
              <div className="card-body">
                <div className="card-name" style={{ textTransform: 'uppercase', fontSize: '1.5rem', letterSpacing: '0.08em' }}>
                  {c.name}
                </div>
                <span className="card-category">{c.product_count} pieces</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}