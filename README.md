# NOIR — Fashion E-Commerce

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

### What NOT to copy

Do not copy these machine-specific folders to the other PC; recreate them via
the steps above:

```
env/          # Python virtual environment (recreated by `python -m venv env`)
endenv/       # older virtual environment (unused)
frontend/node_modules/   # JS dependencies (recreated by `npm install`)
```

Keep `db.sqlite3` (contains the seeded products/categories) and everything else.

## Credentials

Demo admin: `admin` / (password set in your environment) — create accounts
through the Sign Up flow for a full cart → checkout → order journey.

## Deploy to Render (free) + Aiven MySQL

In production, Django serves the built React app directly, so it's a single web
service. The frontend is built with a `/static/` base path (`VITE_BASE=/static/`)
and collected by `collectstatic`, so the React bundle is served by Django.

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "NOIR store"
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

> `env/`, `endenv/`, `frontend/node_modules/`, `frontend/dist/`, `db.sqlite3` and
> `staticfiles/` are git-ignored (they're recreated during setup/build).

### 2. Create the Aiven MySQL database

In the [Aiven console](https://console.aiven.io), create a **MySQL** service
(any plan, free trial works). From **Overview** copy the **Service URI**, e.g.

```
mysql://avnadmin:PASSWORD@host.aivencloud.com:PORT/defaultdb?ssl-mode=REQUIRED
```

### 3. Create the Render web service

1. [render.com](https://render.com) → **New** → **Blueprint** → connect the repo
   (it reads `render.yaml`), **or** **New** → **Web Service** → choose the repo.
2. Add environment variables (Render dashboard → Environment):
   - `DATABASE_URL` = your Aiven Service URI above
   - `DJANGO_ALLOWED_HOSTS` = your `.onrender.com` hostname
   - `DJANGO_SECRET_KEY` = a long random string
   - `DJANGO_DEBUG` = `false`
3. If the app fails to connect to MySQL with an SSL error, also set
   `DB_SSL_CA_PATH` = `/etc/ssl/certs/ca-certificates.crt`.

Render's **release command** runs `migrate` then `seed`, which populates the
MySQL database with the demo categories and products. Your live site gets a URL
like `https://noir-store.onrender.com`.

### Notes

- Product images live in `media/` in the repo, so they work out of the box. New
  uploads are stored on Render's ephemeral disk and reset on redeploy — for real
  production, put them in S3/Aiven Object Storage.
- The `build.sh` runs `npm ci` + `VITE_BASE=/static/ npm run build` then
  `collectstatic` on every deploy.
- Local dev (SQLite) is unaffected: it only uses MySQL when `DATABASE_URL` is set.