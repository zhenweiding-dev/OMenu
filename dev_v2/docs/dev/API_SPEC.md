# REST API Specification

This document defines the backend REST API endpoints for OMenu.

**Base URL**: `http://localhost:8000` (development) or `https://your-backend.railway.app` (production)

---

## Overview

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/meal-plans/generate` | POST | Generate new meal plan |
| `/api/meal-plans/{id}` | GET | Get meal plan by ID |
| `/api/meal-plans/{id}/modify` | POST | Modify existing meal plan |
| `/api/shopping-lists/generate` | POST | Generate shopping list from meal plan |

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

### Generate Meal Plan

```
POST /api/meal-plans/generate
```

Generate a new weekly meal plan based on user preferences.

**Note:** This endpoint uses a two-step Gemini API process:
1. Generate natural language meal plan
2. Convert to structured JSON

This produces more creative and reliable results.

**Request Body**

```json
{
  "keywords": ["Quick", "Healthy", "Chinese"],
  "mustHaveItems": ["Eggs", "Chicken", "Rice"],
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
| `mustHaveItems` | string[] | No | Required ingredients or recipes |
| `dislikedItems` | string[] | No | Ingredients to exclude |
| `numPeople` | integer | Yes | Number of people (1-10) |
| `budget` | integer | Yes | Weekly budget in USD |
| `difficulty` | string | Yes | "easy", "medium", or "hard" |
| `cookSchedule` | object | Yes | Boolean flags for each meal slot |

**Response** `200 OK`

```json
{
  "id": "mp_abc123",
  "createdAt": "2025-01-31T12:00:00Z",
  "status": "ready",
  "preferences": { ... },
  "days": {
    "monday": {
      "breakfast": {
        "id": "mon-breakfast-001",
        "name": "Scrambled Eggs with Tomato",
        "ingredients": [
          { "name": "eggs", "quantity": 4, "unit": "count", "category": "proteins" },
          { "name": "tomato", "quantity": 2, "unit": "count", "category": "vegetables" },
          { "name": "vegetable oil", "quantity": 0, "unit": "", "category": "seasonings" }
        ],
        "instructions": "1. Beat eggs with salt.\n2. Dice tomatoes.\n3. Heat oil, scramble eggs.\n4. Add tomatoes, mix.",
        "estimatedTime": 15,
        "servings": 2,
        "difficulty": "easy",
        "totalCalories": 320
      },
      "lunch": { ... },
      "dinner": { ... }
    },
    "tuesday": {
      "breakfast": null,
      "lunch": { ... },
      "dinner": { ... }
    },
    ...
  }
}
```

**Response Fields**

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique meal plan ID (prefix: `mp_`) |
| `createdAt` | string | ISO 8601 timestamp |
| `status` | string | "ready", "generating", or "error" |
| `preferences` | object | Snapshot of input preferences |
| `days` | object | 7 days, each with breakfast/lunch/dinner |

**Error Responses**

- `400 Bad Request`: Invalid request body
- `422 Unprocessable Entity`: Validation error
- `500 Internal Server Error`: Gemini API error
- `503 Service Unavailable`: Gemini API timeout (2 minutes)

---

### Get Meal Plan

```
GET /api/meal-plans/{id}
```

Retrieve an existing meal plan by ID.

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Meal plan ID |

**Response** `200 OK`

Same format as Generate Meal Plan response.

**Error Responses**

- `404 Not Found`: Meal plan not found

---

### Modify Meal Plan

```
POST /api/meal-plans/{id}/modify
```

Modify an existing meal plan based on user instructions.

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Meal plan ID |

**Request Body**

```json
{
  "modification": "Replace Monday dinner with a vegetarian option",
  "currentPlan": { ... }
}
```

**Request Fields**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `modification` | string | Yes | User's modification request (max 200 chars) |
| `currentPlan` | object | Yes | Current meal plan to modify |

**Response** `200 OK`

Same format as Generate Meal Plan response (with modifications applied).

**Error Responses**

- `400 Bad Request`: Invalid modification request
- `404 Not Found`: Meal plan not found
- `500 Internal Server Error`: Gemini API error

---

### Generate Shopping List

```
POST /api/shopping-lists/generate
```

Generate a consolidated shopping list from a meal plan.

**Request Body**

```json
{
  "mealPlanId": "mp_abc123",
  "mealPlan": { ... }
}
```

**Request Fields**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `mealPlanId` | string | Yes | Associated meal plan ID |
| `mealPlan` | object | Yes | Complete meal plan object |

**Response** `200 OK`

```json
{
  "id": "sl_xyz789",
  "mealPlanId": "mp_abc123",
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
| `mealPlanId` | string | Associated meal plan ID |
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
