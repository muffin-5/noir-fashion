# NOIR - Fashion E-Commerce

A full-stack fashion e-commerce platform. **Django REST Framework** powers a
RESTful JSON API (JWT auth, catalog, cart, checkout, reviews, order history) and
**React (Vite)** delivers a refined, editorial storefront inspired by the
[SAAKINUN](https://dribbble.com/shots/25969139-Fashion-E-commerce-Website)
fashion design language — a neutral palette of ink, espresso, taupe and bone.

## Architecture

```
endsem/            Django project (settings, urls)
home/              Django app
  models.py        Categories, Products, Reviews, Cart, Orders, OrderItems, Customers
  serializers.py   DRF serializers
  api_views.py     API views (auth, catalog, cart, orders)
endsem/urls.py     /api/* routes
frontend/          React 18 + Vite + React Router + Axios
  src/pages        Home, Shop, Product Detail, Bag, Checkout, Sign In, Sign Up, Orders
  src/context      AuthContext (JWT) & CartContext
  src/styles       Design system (SAAKINUN palette, editorial typography)
db.sqlite3         SQLite database (seeded with products/categories)
```

### REST API

| Endpoint | Method | Description |
| --- | --- | --- |
| `/api/auth/register/` | POST | Create account |
| `/api/auth/login/` | POST | JWT tokens |
| `/api/auth/refresh/` | POST | Refresh access token |
| `/api/auth/me/` | GET | Current user |
| `/api/categories/` | GET | Categories + product counts |
| `/api/products/?category=&search=&ordering=` | GET | Filterable catalog |
| `/api/products/<id>/` | GET | Product detail |
| `/api/products/<id>/reviews/` | GET/POST | Reviews |
| `/api/cart/` | GET/POST | View bag / add item |
| `/api/cart/<id>/` | PATCH/DELETE | Update qty / remove |
| `/api/orders/` | GET | Order history |
| `/api/orders/checkout/` | POST | Place order from bag |

## Run it (already set up)

### Backend (terminal 1)

```bash
env\Scripts\python.exe manage.py runserver
```

> Database is `db.sqlite3` (already seeded). Packages are installed in `env\`.

### Frontend (terminal 2)

```bash
cd frontend
npm run dev
```

Open **http://localhost:5173** — the Vite dev server proxies `/api`, `/media`
and `/static` to Django on `:8000`.

## Fresh install on another PC

### Requirements

- Python **3.10+** (tested on 3.13)
- Node.js **18+** (tested on 24) and npm

### Steps

```bash
# 1. Backend
python -m venv env
env\Scripts\activate            # macOS/Linux: source env/bin/activate
pip install -r requirements.txt

# 2. Frontend
cd frontend
npm install

# 3. Start both servers (two terminals)
#   terminal 1:
python manage.py runserver
#   terminal 2:
cd frontend && npm run dev
```

Then open **http://localhost:5173**.

> **One-shot scripts:** run `setup.bat` on **Windows** or `setup.sh` on
> **macOS/Linux** (make it executable with `chmod +x setup.sh`) in the project
> root. Either creates the venv, installs backend deps, installs frontend deps,
> and applies migrations. They do **not** start the servers (so you control
> them in your own terminals).


Keep `db.sqlite3` (contains the seeded products/categories) and everything else.
