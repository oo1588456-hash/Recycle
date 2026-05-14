# ReCycle API (v1)

Base URL: `http://localhost:8005/api/v1/`

All authenticated routes expect:

```http
Authorization: Bearer <access_token>
```

## Auth

### Register

`POST /auth/register/`

```json
{
  "email": "seller@example.com",
  "username": "seller1",
  "full_name": "Seller One",
  "password": "Password123",
  "role": "seller"
}
```

### Login

`POST /auth/login/`

```json
{
  "email": "seller@example.com",
  "password": "Password123"
}
```

Response:

```json
{
  "access": "...",
  "refresh": "...",
  "user": { "id": 1, "email": "...", "role": "seller" }
}
```

### Refresh / Me

- `POST /auth/refresh/` with `{ "refresh": "..." }`
- `GET /auth/me/`, `PATCH /auth/me/`

## Categories

- `GET /categories/` — public list (paginated).
- `POST /categories/` — admin only; body includes `name`, optional `slug`.

## Products

- `GET /products/?search=&category=&min_price=&max_price=&condition=&seller=&status=` — browse (active + own drafts when authenticated).
- `POST /products/` — authenticated seller; creates listing.
- `GET /products/{id}/`, `PATCH /products/{id}/`, `DELETE /products/{id}/` — detail; update/delete owner or admin.
- `POST /products/{id}/upload-image/` — multipart `image`, `is_primary`.
- `POST /products/{id}/publish/`, `POST /products/{id}/mark-sold/`
- `GET /my-products/` — current user’s listings.

## AI

- `POST /ai/analyze/` — multipart or JSON fields: `title`, `category`, `brand`, `original_price`, ages, `user_declared_condition`, optional `image`.
- `POST /ai/analyze-product/{product_id}/` — owner/admin; updates listing AI fields.
- `GET /ai/history/`
- `GET /ai/dataset-report/` — JSON summary or markdown fallback.

## Chat

- `GET /chat/messages/?product=&receiver=`
- `POST /chat/messages/` — `{ "receiver": 2, "product": 5, "message": "..." }`
- `GET /chat/conversations/`

## Documentation UI

- Swagger: `http://localhost:8005/api/docs/`
