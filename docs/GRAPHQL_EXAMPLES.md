# 🎨 GraphQL API Examples

Complete examples for using the GraphQL API.

GraphQL Endpoint: `http://localhost:3000/graphql`

---

## 🌐 GraphQL Playground

Open in your browser:
```
http://localhost:3000/graphql
```

You'll get an interactive playground with autocomplete!

---

## 📦 Products API

### 1. List All Products

```graphql
query GetProducts {
  products(limit: 10, offset: 0) {
    id
    title
    handle
    status
    vendor
    productType
    createdAt
    updatedAt
  }
}
```

### 2. Filter by Status

```graphql
query GetActiveProducts {
  products(status: ACTIVE) {
    id
    title
    status
  }
}
```

### 3. Get Single Product

```graphql
query GetProduct {
  product(id: "abc123") {
    id
    title
    description
    status
    vendor
    variants {
      id
      sku
      price
      barcode
    }
  }
}
```

### 4. Get Product by Handle

```graphql
query GetProductByHandle {
  productByHandle(handle: "awesome-tshirt") {
    id
    title
    description
  }
}
```

### 5. Search Products

```graphql
query SearchProducts {
  searchProducts(query: "shirt") {
    id
    title
    handle
  }
}
```

---

## ✏️ Mutations

### 1. Create Product

```graphql
mutation CreateProduct {
  createProduct(
    input: {
      handle: "cool-hoodie"
      title: "Cool Hoodie"
      description: "A very cool hoodie"
      vendor: "Brand X"
      productType: "Apparel"
      status: DRAFT
    }
  ) {
    id
    title
    handle
    status
  }
}
```

### 2. Update Product

```graphql
mutation UpdateProduct {
  updateProduct(
    id: "abc123"
    input: {
      title: "Updated Title"
      description: "Updated description"
      status: ACTIVE
    }
  ) {
    id
    title
    status
    updatedAt
  }
}
```

### 3. Delete Product

```graphql
mutation DeleteProduct {
  deleteProduct(id: "abc123")
}
```

### 4. Add Variant to Product

```graphql
mutation AddVariant {
  addVariant(
    productId: "product-123"
    input: {
      sku: "HOODIE-M-BLK"
      title: "Cool Hoodie - Medium - Black"
      price: 49.99
      compareAtPrice: 59.99
      barcode: "1234567890123"
      taxable: true
      requiresShipping: true
    }
  ) {
    id
    sku
    price
  }
}
```

---

## 🔥 Advanced Queries

### Nested Query with Variables

```graphql
query GetProductWithVariants($productId: ID!) {
  product(id: $productId) {
    id
    title
    description
    status
    variants {
      id
      sku
      title
      price
      compareAtPrice
      taxable
      weight {
        value
        unit
      }
    }
  }
}

# Variables:
{
  "productId": "abc123"
}
```

### Mutation with Variables

```graphql
mutation CreateProductWithVariables($input: CreateProductInput!) {
  createProduct(input: $input) {
    id
    title
    handle
    status
  }
}

# Variables:
{
  "input": {
    "handle": "new-product",
    "title": "New Product",
    "status": "ACTIVE"
  }
}
```

### Fragments (Reusable Fields)

```graphql
fragment ProductFields on Product {
  id
  title
  handle
  status
  vendor
  createdAt
}

query GetProducts {
  products {
    ...ProductFields
  }
}

query GetProduct {
  product(id: "abc123") {
    ...ProductFields
    description
    variants {
      id
      sku
      price
    }
  }
}
```

---

## 🧪 Using with HTTP Clients

### cURL

```bash
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { products { id title } }"
  }'
```

### JavaScript (Fetch)

```javascript
const query = `
  query GetProducts {
    products(limit: 10) {
      id
      title
      handle
    }
  }
`;

const response = await fetch('http://localhost:3000/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ query }),
});

const data = await response.json();
console.log(data);
```

### TypeScript (with types)

```typescript
interface Product {
  id: string;
  title: string;
  handle: string;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
}

interface ProductsResponse {
  data: {
    products: Product[];
  };
}

const query = `
  query GetProducts {
    products {
      id
      title
      handle
      status
    }
  }
`;

const response = await fetch('http://localhost:3000/graphql', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query }),
});

const result: ProductsResponse = await response.json();
```

---

## 🔐 With Authentication (TODO)

Once auth is implemented:

```graphql
query GetProducts {
  products {
    id
    title
  }
}

# HTTP Headers:
{
  "Authorization": "Bearer <your-jwt-token>"
}
```

---

## 📊 Introspection Queries

Get the schema:

```graphql
query IntrospectionQuery {
  __schema {
    types {
      name
      kind
      description
    }
  }
}
```

Get available queries:

```graphql
query GetQueries {
  __schema {
    queryType {
      fields {
        name
        description
        type {
          name
        }
      }
    }
  }
}
```

---

## 🎯 Best Practices

1. **Use variables** instead of hardcoding values
2. **Use fragments** for reusable field selections
3. **Request only needed fields** (avoid over-fetching)
4. **Use aliases** when querying same field multiple times
5. **Add descriptions** to your mutations/queries

### Example with Aliases

```graphql
query GetMultipleProducts {
  first: product(id: "abc123") {
    id
    title
  }
  second: product(id: "def456") {
    id
    title
  }
}
```

---

## 🐛 Error Handling

GraphQL returns errors in a standard format:

```json
{
  "errors": [
    {
      "message": "Product with id xyz not found",
      "locations": [{ "line": 2, "column": 3 }],
      "path": ["product"]
    }
  ],
  "data": {
    "product": null
  }
}
```

---

## 📚 Tools

- **GraphQL Playground**: Built-in at `/graphql`
- **Postman**: GraphQL support
- **Insomnia**: Great GraphQL client
- **Apollo Client**: For frontend integration
- **urql**: Lightweight GraphQL client

---

**Enjoy your GraphQL API!** 🚀
