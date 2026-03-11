# Ecom Platform (Full-Stack)

This is a full-stack e-commerce app:
- Backend: Spring Boot (JWT auth, roles, orders/checkout, wishlist, ratings, search/filter/sort/paging)
- Frontend: React + Vite (customer + admin UI)

## Folders
- Backend: `C:\downloads\ecom-proj\ecom-proj`
- Frontend: `C:\downloads\ecom-frontend-4-main\ecom-frontend-4-main`

## Quick Start (Dev)

### 1) Start backend (H2 default)
```powershell
cd C:\downloads\ecom-proj\ecom-proj
.\mvnw.cmd spring-boot:run
```
Backend: `http://localhost:8080`
- H2 console: `http://localhost:8080/h2-console`
- Health: `http://localhost:8080/actuator/health`

### 2) Start frontend
```powershell
cd C:\downloads\ecom-frontend-4-main\ecom-frontend-4-main
npm install
npm run dev
```
Frontend: `http://localhost:5173`

Vite proxies `/api` to the backend, and the frontend defaults to `/api` as its API base URL.

## Run With Postgres (Recommended)

A `docker-compose.yml` is provided here:
- `C:\downloads\ecom-proj\docker-compose.yml`

It runs:
- Postgres on `localhost:5432`
- Backend on `localhost:8080`
- Web (Nginx serving the frontend + proxying `/api` to backend) on `localhost:5173`

```powershell
cd C:\downloads\ecom-proj
docker compose up --build
```

Notes:
- Flyway migrations are enabled in compose (`FLYWAY_ENABLED=true`) and JPA runs with `validate`.
- Default seeded admin is configured via env vars (see `JWT_SECRET`, `SEED_ADMIN_EMAIL`, etc. in `ecom-proj\src\main\resources\application.properties`).

## Demo Accounts
- Admin (seeded): `admin@ecom.local` / `admin12345`
- Customers: use Sign up in the UI

## Key API Endpoints
- Auth: `POST /api/auth/signup`, `POST /api/auth/login`
- Products (paged): `GET /api/products/paged?q=...&category=...&brand=...&minPrice=...&maxPrice=...&minRating=...&sort=price,desc&page=0&size=12`
- Ratings: `GET /api/products/{id}/rating`, `POST /api/products/{id}/rating`
- Wishlist: `GET /api/wishlist`, `POST /api/wishlist/{productId}`, `DELETE /api/wishlist/{productId}`
- Orders: `POST /api/orders/checkout`, `GET /api/orders`

## Tests
```powershell
cd C:\downloads\ecom-proj\ecom-proj
.\mvnw.cmd test
```