# NOIR – Fashion E-Commerce Platform

A full-stack fashion e-commerce platform with a **Django REST Framework** backend
and a **React (Vite)** storefront. The API exposes JWT authentication, product
catalog, cart, checkout, order history and reviews, while the frontend delivers
an editorial, image-first storefront inspired by the
[SAAKINUN](https://dribbble.com/shots/25969139-Fashion-E-commerce-Website) design
language – a neutral palette of ink, espresso, taupe and bone.

> Live demo: [noir-fashion.onrender.com](https://noir-fashion.onrender.com)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Data Model](#data-model)
- [REST API](#rest-api)
- [Production Hardening](#production-hardening)
- [Deployment](#deployment)
- [Local Development](#local-development)
- [Management Commands](#management-commands)
- [Testing](#testing)
- [Roadmap](#roadmap)
- [Acknowledgements](#acknowledgements)

---

## Features

- **JWT authentication** – register, login, token refresh and current-user lookup
  backed by `djangorestframework-simplejwt`.
- **Catalog** – filterable and searchable product listings with category and
  price ordering, plus per-product detail and reviews.
- **Cart** – per-user shopping bag with quantity updates (add, patch, delete).
- **Checkout** – transactional order creation that persists a customer profile
  and order items in a single request.
- **Order history** – authenticated users can list their past orders.
- **Production-grade static & media serving** – WhiteNoise serves bundled static
  files and product images with long-lived cache headers.
- **Dual-database support** – SQLite for local development, MySQL (Aiven) in
  production, switched via a single environment variable.
- **Idempotent seeding** – reproducible catalog data for local and production.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Backend | Python 3.10+ (tested 3.13), Django 6.0.1, Django REST Framework 3.18.0 |
| Auth | djangorestframework-simplejwt (JWT access/refresh tokens) |
| Database | SQLite (dev) / MySQL 8.4 on Aiven (prod), via PyMySQL |
| Frontend | React 18, Vite, React Router, Axios |
| Static/media | WhiteNoise (with one-day browser cache) |
| Deployment | Gunicorn + WSGI on Render (free tier) |

## Architecture

```
┌─────────────────────────────┐        ┌──────────────────────────────┐
│        React (Vite)         │  HTTP  │        Django (DRF)          │
│  Storefront · SPA          │ ──────► │  /api/* · JWT · WhiteNoise  │
└─────────────────────────────┘        └──────────────┬───────────────┘
                                                      │
                                                      ▼
                                          ┌──────────────────────────┐
                                          │   MySQL 8.4 (Aiven)      │
                                          │  / SQLite (local)        │
                                          └──────────────────────────┘
```

```
endsem/                 Django project (settings, urls, WSGI)
  settings.py           Env-driven config, DB abstraction, cache policy
  urls.py               /api/* routes + production media serving
  whitenoise_media.py   WhiteNoise middleware that also serves /media/
home/                   Django application
  models.py             Categories, Products, Customers, Orders,
                        OrderItems, Reviews, Payments, Cart
  serializers.py        DRF serializers
  api_views.py          API views (auth, catalog, cart, orders)
  management/commands/  seed.py, db_query.py
frontend/               React 18 + Vite + React Router + Axios
  src/pages/            Home, Shop, Product Detail, Bag, Checkout,
                        Sign In, Sign Up, Orders, Profile
  src/context/          AuthContext (JWT) & CartContext
  src/styles/           Design system (SAAKINUN palette)
```

## Data Model

| Model | Purpose |
| --- | --- |
| `Categories` | Product taxonomy with name |
| `Products` | Catalog items – name, image, price, stock, description, category |
| `Customers` | Billing/shipping profile captured at checkout (phone, addresses) |
| `Orders` / `OrderItems` | Order header + line items with quantity and subtotal |
| `Reviews` | Per-product customer ratings and comments |
| `Payments` | Payment records per order |
| `Cart` | Per-user bag entries linking a product and quantity |

## REST API

All catalog and order endpoints are available under `/api/`. Authenticated
endpoints require the `Authorization: Bearer <access>` header.

| Endpoint | Method | Auth | Description |
| --- | --- | --- | --- |
| `/api/auth/register/` | POST | – | Create account |
| `/api/auth/login/` | POST | – | Exchange credentials for JWT tokens |
| `/api/auth/refresh/` | POST | – | Rotate the access token |
| `/api/auth/me/` | GET | yes | Current user profile |
| `/api/categories/` | GET | – | Categories with product counts |
| `/api/products/?category=&search=&ordering=` | GET | – | Filterable, searchable catalog |
| `/api/products/<id>/` | GET | – | Product detail |
| `/api/products/<id>/reviews/` | GET / POST | POST: yes | List / create reviews |
| `/api/cart/` | GET / POST | yes | View bag / add item |
| `/api/cart/<id>/` | PATCH / DELETE | yes | Update quantity / remove |
| `/api/orders/` | GET | yes | Order history |
| `/api/orders/checkout/` | POST | yes | Create an order from the bag |

## Production Hardening

- **Database portability** – the codebase fakes the `mysqlclient` version
  reported by PyMySQL so Django 6 works with the pure-Python driver, and keeps
  the same model layer across SQLite and MySQL.
- **MySQL on Aiven** – connections use TLS (Aiven's implicit-TLS proxy) with
  explicit connect/read/write timeouts so a stalled database never hangs the
  web process.
- **Static & media caching** – WhiteNoise serves both `/static/` and `/media/`
  with `Cache-Control: max-age=86400`, so images load from the browser cache
  after the first visit instead of being re-downloaded on every navigation.
- **Production media routing** – Django's `static()` helper emits nothing when
  `DEBUG=False`; explicit media routes keep product images working in prod.
- **Environment-driven config** – secret key, debug flag, allowed hosts and the
  database URL are all supplied via environment variables, never committed.

## Deployment

The app is deployed to **Render** (free web service) against **Aiven MySQL**.
Render's build command compiles the frontend into Django's static assets, and
the start command runs migrations, seeding and Gunicorn in one shot.

**Environment variables**

| Variable | Required | Example |
| --- | --- | --- |
| `DJANGO_SECRET_KEY` | yes | any strong random string |
| `DJANGO_DEBUG` | yes | `false` |
| `DJANGO_ALLOWED_HOSTS` | yes | `noir-fashion.onrender.com` |
| `DATABASE_URL` | yes | `mysql://user:pass@host:port/defaultdb` |

**Start command**

```bash
python manage.py migrate && python manage.py seed && \
  gunicorn endsem.wsgi:application --bind 0.0.0.0:$PORT
```

## Local Development

### Requirements

- Python 3.10+ (tested on 3.13)
- Node.js 18+ and npm (tested on 24)

### One-shot setup

Run `setup.bat` on **Windows** or `setup.sh` on **macOS/Linux** (`chmod +x
setup.sh`) from the project root. Either script creates a virtual environment,
installs backend dependencies, installs frontend dependencies and applies
migrations. It does **not** start the servers, so you keep control in your own
terminals.

### Manual setup

```bash
# 1. Backend
python -m venv env
env\Scripts\activate            # macOS/Linux: source env/bin/activate
pip install -r requirements.txt

# 2. Frontend
cd frontend
npm install
```

### Run the app (two terminals)

```bash
# terminal 1 – Django API on :8000
python manage.py runserver

# terminal 2 – Vite dev server on :5173
cd frontend && npm run dev
```

Open **http://localhost:5173** – the Vite dev server proxies `/api`, `/media`
and `/static` to Django on `:8000`.

## Management Commands

| Command | Description |
| --- | --- |
| `python manage.py seed` | Idempotently load the seed catalog (products + categories) |
| `python manage.py db_query "SELECT ..."` | Run raw SQL against the configured database for quick inspection |
| `python manage.py createsuperuser` | Create a Django admin user |

## Testing

The test harness is scaffolded (`home/tests.py`); a pytest suite covering the
API surface and checkout flow is in progress.

## Roadmap

- Expand automated tests (pytest + GitHub Actions CI).
- Merge product additions from `seed.json` into existing databases so seeded
  catalog changes persist across redeploys.
- Add payment gateway integration on top of the existing `Payments` model.
- Add admin superuser provisioning for the production database.

## Acknowledgements

UI design language adapted from
[SAAKINUN – Fashion E-commerce Website](https://dribbble.com/shots/25969139-Fashion-E-commerce-Website).