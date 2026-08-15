import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import client from '../api/client'
import ProductCard from '../components/ProductCard'

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState('')

  const selected = new Set((searchParams.get('category') || '').split(',').filter(Boolean))
  const search = searchParams.get('search') || ''

  const queryString = new URLSearchParams({
    category: [...selected].join(','),
    search,
    ordering: sort,
  }).toString()

  useEffect(() => {
    client.get('/categories/').then((res) => setCategories(res.data.results ?? res.data)).catch(() => {})
  }, [])

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await client.get(`/products/?${queryString}`)
      setProducts(data.results ?? data)
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [queryString])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const toggleCategory = (id) => {
    const next = new Set(selected)
    if (next.has(String(id))) next.delete(String(id))
    else next.add(String(id))
    const params = new URLSearchParams(searchParams)
    if (next.size) params.set('category', [...next].join(','))
    else params.delete('category')
    setSearchParams(params, { replace: true })
  }

  return (
    <div>
      <div className="page-head">
        <span className="eyebrow">The Collection</span>
        <h1 className="display">Shop All</h1>
      </div>
      <div className="container catalog">
        <aside className="filters">
          <h4>Categories</h4>
          {categories.map((c) => (
            <label key={c.category_id} className="filter-item">
              <input
                type="checkbox"
                checked={selected.has(String(c.category_id))}
                onChange={() => toggleCategory(c.category_id)}
              />
              <span>{c.name}</span>
            </label>
          ))}
          <div style={{ marginTop: '1.4rem' }}>
            <button
              className="btn-ghost eyebrow"
              onClick={() => setSearchParams({}, { replace: true })}
            >
              Clear filters
            </button>
          </div>
        </aside>

        <div>
          <div className="sort-row">
            <span className="catalog-count">
              {loading ? 'Loading…' : `${products.length} piece${products.length === 1 ? '' : 's'}`}
            </span>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="">Sort by – Featured</option>
              <option value="price">Price – Low to High</option>
              <option value="-price">Price – High to Low</option>
            </select>
          </div>
          {loading ? (
            <div className="loading-wrap"><div className="spinner" /></div>
          ) : products.length === 0 ? (
            <div className="empty">
              <h2 className="display">Nothing found</h2>
              <p>Try adjusting your filters or browse the full collection.</p>
              <button className="btn btn-outline" onClick={() => setSearchParams({}, { replace: true })}>
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid">
              {products.map((p) => (
                <ProductCard key={p.product_id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}