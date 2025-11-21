# 📚 API Reference

Complete API documentation for E-commerce Backend + POS

**Base URL:** `http://localhost:3000/api/v1`

---

## 🔐 Authentication

### Register

```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:** `201 Created`
```json
{
  "data": {
    "userId": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

---

### Login

```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Response:** `200 OK`
```json
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "roles": ["CUSTOMER"]
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

---

### Refresh Token

```http
POST /auth/refresh
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Response:** `200 OK`
```json
{
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

---

## 📦 Products

### List Products

```http
GET /products?limit=20&offset=0&status=active
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit` (optional): Number of items (default: 50, max: 100)
- `offset` (optional): Pagination offset (default: 0)
- `status` (optional): Filter by status (`draft`, `active`, `archived`)

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "uuid",
      "handle": "product-handle",
      "title": "Product Title",
      "description": "Product description",
      "status": "active",
      "vendor": "Brand Name",
      "variantsCount": 3,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### Get Product

```http
GET /products/:id
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "data": {
    "id": "uuid",
    "handle": "product-handle",
    "title": "Product Title",
    "description": "Product description",
    "status": "active",
    "vendor": "Brand Name",
    "productType": "Electronics",
    "variants": [
      {
        "id": "uuid",
        "sku": "SKU-001",
        "barcode": "123456789",
        "title": "Variant Title",
        "price": 29.99,
        "currency": "USD",
        "taxable": true
      }
    ],
    "images": [],
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### Create Product

```http
POST /products
Authorization: Bearer <token>
```

**Required Roles:** `ADMIN`, `STAFF`

**Request Body:**
```json
{
  "handle": "new-product",
  "title": "New Product",
  "description": "Product description",
  "vendor": "Brand Name",
  "productType": "Electronics",
  "status": "draft"
}
```

**Response:** `201 Created`

---

### Update Product

```http
PATCH /products/:id
Authorization: Bearer <token>
```

**Required Roles:** `ADMIN`, `STAFF`

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description"
}
```

**Response:** `200 OK`

---

### Add Variant

```http
POST /products/:id/variants
Authorization: Bearer <token>
```

**Required Roles:** `ADMIN`, `STAFF`

**Request Body:**
```json
{
  "sku": "SKU-001",
  "barcode": "123456789",
  "title": "Variant Title",
  "price": 29.99,
  "compareAtPrice": 39.99,
  "taxable": true,
  "requiresShipping": true
}
```

**Response:** `201 Created`

---

## 📝 Orders

### List Orders

```http
GET /orders
Authorization: Bearer <token>
```

**Response:** `200 OK`

---

### Create Order

```http
POST /orders
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "customerId": "uuid",
  "email": "customer@example.com",
  "items": [
    {
      "variantId": "uuid",
      "quantity": 2,
      "price": 29.99
    }
  ],
  "shippingAddress": {
    "firstName": "John",
    "lastName": "Doe",
    "address1": "123 Main St",
    "city": "New York",
    "province": "NY",
    "country": "US",
    "zip": "10001"
  }
}
```

**Response:** `201 Created`

---

## 🏪 POS

### Open POS Session

```http
POST /pos/sessions
Authorization: Bearer <token>
```

**Required Roles:** `POS_OPERATOR`, `STAFF`

**Request Body:**
```json
{
  "warehouseId": "uuid",
  "openingCash": 100.00
}
```

**Response:** `201 Created`

---

### Product Lookup (Barcode/SKU)

```http
GET /pos/products/lookup?barcode=123456789
GET /pos/products/lookup?sku=SKU-001
Authorization: Bearer <token>
```

**Required Roles:** `POS_OPERATOR`, `STAFF`

**Response:** `200 OK`
```json
{
  "data": {
    "id": "uuid",
    "sku": "SKU-001",
    "barcode": "123456789",
    "title": "Product Title",
    "price": 29.99,
    "inStock": true
  }
}
```

---

### Create POS Sale

```http
POST /pos/sales
Authorization: Bearer <token>
```

**Required Roles:** `POS_OPERATOR`, `STAFF`

**Request Body:**
```json
{
  "sessionId": "uuid",
  "items": [
    {
      "variantId": "uuid",
      "quantity": 1,
      "price": 29.99
    }
  ],
  "paymentMethod": "cash"
}
```

**Response:** `201 Created`

---

## 📊 Inventory

### Check Stock Level

```http
GET /inventory/stock/:variantId
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "data": {
    "variantId": "uuid",
    "available": 100,
    "reserved": 5,
    "total": 105
  }
}
```

---

## 🎁 Promotions

### Validate Coupon

```http
POST /promotions/validate-coupon
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "code": "SAVE10"
}
```

**Response:** `200 OK`
```json
{
  "data": {
    "valid": true,
    "code": "SAVE10",
    "discountType": "percentage",
    "discountValue": 10
  }
}
```

---

## ⚠️ Error Responses

All errors follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

**Common Error Codes:**
- `400` - Validation Error
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error
