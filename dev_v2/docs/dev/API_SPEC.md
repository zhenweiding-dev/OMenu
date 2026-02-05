# REST API Specification

> 备注：本文术语已统一为 Menu Book（原 Meal Plan），字段细节以 `dev_v2/docs/FIELD_SCHEMA_OVERVIEW.md` 与现有代码为准。

This document defines the backend REST API endpoints for OMenu.

> 备注：本文已将 “Meal Plan” 统一更名为 “Menu Book”（一周菜单簿），接口与字段同步更新。

**Base URL**: `http://localhost:8000` (development) or `https://your-backend.railway.app` (production)

---

## Overview

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/menu-books/generate` | POST | Generate new menu book |
| `/api/menu-books/{id}` | GET | Get menu book by ID |
| `/api/menu-books/{id}/modify` | POST | Modify existing menu book |
| `/api/shopping-lists/generate` | POST | Generate shopping list from menu book |

---

## Endpoints

### Health Check

```
GET /api/health
```

**Response** `200 OK`
```json
{
  "status": "ok",
  "version": "1.0.0",
  "timestamp": "2025-01-31T12:00:00Z"
}
```

---

### Generate Menu Book

```
POST /api/menu-books/generate
```

Generate a new weekly menu book based on user preferences.

**Note:** This endpoint uses a two-step Gemini API process:
1. Generate natural language menu book
2. Convert to structured JSON

This produces more creative and reliable results.

**Request Body**

```json
{
  "keywords": ["Quick", "Healthy", "Chinese"],
  "preferredItems": ["Eggs", "Chicken", "Rice"],
  "dislikedItems": ["Peanuts", "Cilantro"],
  "numPeople": 2,
  "budget": 100,
  "difficulty": "medium",
  "cookSchedule": {
    "monday": { "breakfast": true, "lunch": true, "dinner": true },
    "tuesday": { "breakfast": false, "lunch": true, "dinner": true },
    "wednesday": { "breakfast": false, "lunch": true, "dinner": true },
    "thursday": { "breakfast": false, "lunch": true, "dinner": true },
    "friday": { "breakfast": false, "lunch": true, "dinner": true },
    "saturday": { "breakfast": true, "lunch": true, "dinner": true },
    "sunday": { "breakfast": true, "lunch": false, "dinner": false }
  }
}
```

**Request Fields**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `keywords` | string[] | No | Cooking style, diet, cuisine preferences |
| `preferredItems` | string[] | No | Required ingredients or recipes |
| `dislikedItems` | string[] | No | Ingredients to exclude |
| `numPeople` | integer | Yes | Number of people (1-10) |
| `budget` | integer | Yes | Weekly budget in USD |
| `difficulty` | string | Yes | "easy", "medium", or "hard" |
| `cookSchedule` | object | Yes | Boolean flags for each meal slot |

**Response** `200 OK`

```json
{
  "id": "mb_abc123",
  "createdAt": "2025-01-31T12:00:00Z",
  "status": "ready",
  "preferences": { ... },
  "menus": {
    "monday": {
      "breakfast": [
        {
          "id": "mon-breakfast-001",
          "name": "Scrambled Eggs with Tomato",
          "ingredients": [
            { "name": "eggs", "quantity": 4, "unit": "count", "category": "proteins" },
            { "name": "tomato", "quantity": 2, "unit": "count", "category": "vegetables" },
            { "name": "vegetable oil", "quantity": 0, "unit": "", "category": "seasonings" }
          ],
          "instructions": "1. Beat eggs with salt. 2. Dice tomatoes. 3. Heat oil, scramble eggs. 4. Add tomatoes, mix.",
          "estimatedTime": 15,
          "servings": 2,
          "difficulty": "easy",
          "totalCalories": 320,
          "source": "ai"
        }
      ],
      "lunch": [],
      "dinner": []
    },
    "tuesday": {
      "breakfast": [],
      "lunch": [],
      "dinner": []
    },
    ...
  }
}
```

**Response Fields**

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique menu book ID (prefix: `mb_`) |
| `createdAt` | string | ISO 8601 timestamp |
| `status` | string | "ready", "generating", or "error" |
| `preferences` | object | Snapshot of input preferences |
| `menus` | object | 7 days, each with breakfast/lunch/dinner |

**Error Responses**

- `400 Bad Request`: Invalid request body
- `422 Unprocessable Entity`: Validation error
- `500 Internal Server Error`: Gemini API error
- `503 Service Unavailable`: Gemini API timeout (2 minutes)

---

### Get Menu Book

```
GET /api/menu-books/{id}
```

Retrieve an existing menu book by ID.

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Menu book ID |

**Response** `200 OK`

Same format as Generate Menu Book response.

**Error Responses**

- `404 Not Found`: Menu book not found

---

### Modify Menu Book

```
POST /api/menu-books/{id}/modify
```

Modify an existing menu book based on user instructions.

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Menu book ID |

**Request Body**

```json
{
  "modification": "Replace Monday dinner with a vegetarian option",
  "currentMenuBook": { ... }
}
```

**Request Fields**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `modification` | string | Yes | User's modification request (max 200 chars) |
| `currentMenuBook` | object | Yes | Current menu book to modify |

**Response** `200 OK`

Same format as Generate Menu Book response (with modifications applied).

**Error Responses**

- `400 Bad Request`: Invalid modification request
- `404 Not Found`: Menu book not found
- `500 Internal Server Error`: Gemini API error

---

### Generate Shopping List

```
POST /api/shopping-lists/generate
```

Generate a consolidated shopping list from a menu book.

**Request Body**

```json
{
  "menuBookId": "mb_abc123",
  "menus": {
    "monday": { "breakfast": [], "lunch": [], "dinner": [] },
    "tuesday": { "breakfast": [], "lunch": [], "dinner": [] },
    "...": "..."
  }
}
```

**Request Fields**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `menuBookId` | string | Yes | Associated menu book ID |
| `menus` | object | Yes | Weekly menus (7 days) |

**Response** `200 OK`

```json
{
  "id": "sl_xyz789",
  "menuBookId": "mb_abc123",
  "createdAt": "2025-01-31T12:05:00Z",
  "items": [
    {
      "id": "item_001",
      "name": "Eggs",
      "category": "proteins",
      "totalQuantity": 12,
      "unit": "count",
      "purchased": false
    },
    {
      "id": "item_002",
      "name": "Chicken Breast",
      "category": "proteins",
      "totalQuantity": 2,
      "unit": "lbs",
      "purchased": false
    },
    {
      "id": "item_003",
      "name": "Soy Sauce",
      "category": "seasonings",
      "totalQuantity": 0,
      "unit": "",
      "purchased": false
    }
  ]
}
```

**Response Fields**

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique shopping list ID (prefix: `sl_`) |
| `menuBookId` | string | Associated menu book ID |
| `createdAt` | string | ISO 8601 timestamp |
| `items` | array | Consolidated shopping items |

**Shopping Item Fields**

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique item ID |
| `name` | string | Item name |
| `category` | string | Category (see below) |
| `totalQuantity` | number | Aggregated quantity (0 for seasonings) |
| `unit` | string | Unit ("" for seasonings) |
| `purchased` | boolean | Checked off status |

**Categories**

```
proteins, vegetables, fruits, grains, dairy, seasonings, pantry_staples, others
```

**Note**: `seasonings` category items have `totalQuantity: 0` and `unit: ""` — quantity is NOT displayed in UI.

---

## Error Response Format

All error responses follow this format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body",
    "details": [
      {
        "field": "numPeople",
        "message": "must be between 1 and 10"
      }
    ]
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400/422 | Request validation failed |
| `NOT_FOUND` | 404 | Resource not found |
| `GEMINI_ERROR` | 500 | Gemini API returned error |
| `GEMINI_TIMEOUT` | 503 | Gemini API timeout |
| `PARSE_ERROR` | 500 | Failed to parse Gemini response |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## Rate Limiting

MVP does not implement rate limiting. For production, consider:

- 10 requests per minute per IP for generation endpoints
- No limit for GET endpoints

---

## Authentication (Future)

MVP does not require authentication. Future versions will support:

```
Authorization: Bearer <jwt_token>
```

---

## CORS Configuration

Development:
```
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

Production:
```
CORS_ORIGINS=https://omenu.vercel.app
```

---

## OpenAPI Documentation

FastAPI auto-generates OpenAPI documentation:

- **Swagger UI**: `GET /docs`
- **ReDoc**: `GET /redoc`
- **OpenAPI JSON**: `GET /openapi.json`