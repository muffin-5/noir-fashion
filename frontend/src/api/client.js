import axios from 'axios'

const client = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('access')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

client.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config
    if (
      err.response?.status === 401 &&
      !original._retry &&
      localStorage.getItem('refresh')
    ) {
      original._retry = true
      try {
        const { data } = await axios.post('/api/auth/refresh/', {
          refresh: localStorage.getItem('refresh'),
        })
        localStorage.setItem('access', data.access)
        original.headers.Authorization = `Bearer ${data.access}`
        return client(original)
      } catch {
        localStorage.removeItem('access')
        localStorage.removeItem('refresh')
      }
    }
    return Promise.reject(err)
  }
)

export function getErrorMessage(err, fallback = 'Something went wrong. Please try again.') {
  if (err.response?.data?.detail) return err.response.data.detail
  if (err.response?.data) {
    const keys = Object.keys(err.response.data)
    if (keys.length) {
      return keys
        .map((k) => `${k}: ${Array.isArray(err.response.data[k]) ? err.response.data[k][0] : err.response.data[k]}`)
        .join(' ')
    }
  }
  return err.message || fallback
}

export default client