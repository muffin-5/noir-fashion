import { Link } from 'react-router-dom'

export default function ProductCard({ product }) {
  return (
    <Link to={`/products/${product.product_id}`} className="card fade-in">
      <div className="card-media">
        <img src={product.image_url} alt={product.name} loading="lazy" />
      </div>
      <div className="card-body">
        <div>
          <div className="card-name">{product.name}</div>
          <div className="card-category">{product.category}</div>
        </div>
        <div className="card-price">&#8377;{Number(product.price).toLocaleString('en-IN')}</div>
      </div>
    </Link>
  )
}