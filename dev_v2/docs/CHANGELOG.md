# Documentation Changelog

> 备注：本文术语已统一为 Menu Book（原 Meal Plan），字段细节以 `dev_v2/docs/FIELD_SCHEMA_OVERVIEW.md` 与现有代码为准。

## Version 2.0 - Frontend-Backend Separation

**Date**: January 31, 2025

### Overview

This update restructures OMenu from a monolithic React application to a separated frontend-backend architecture. This change improves debuggability, enables code reuse for future iOS development, and follows industry best practices for AI-powered applications.

---

## Summary of Changes

### Architecture Changes

| Aspect | Before (v1) | After (v2) |
|--------|-------------|------------|
| Structure | Monolithic React app | Separated Frontend + Backend |
| Gemini API calls | Direct from frontend | Through backend API |
| API key storage | Frontend env variable | Backend only (secure) |
| State management | Zustand (all state) | Zustand (UI) + Backend (data) |
| Data persistence | localStorage + IndexedDB | localStorage (drafts) + Backend |
| Testing | Hard to isolate | Independent API testing |

### New Files

| File | Purpose |
|------|---------|
| `CHANGELOG.md` | This file - tracks all changes |
| `API_SPEC.md` | REST API endpoint specification |
| `BACKEND.md` | Backend architecture and setup guide |
| `FRONTEND.md` | Frontend architecture (extracted from TECH_STACK.md) |

### Updated Files

| File | Changes |
|------|---------|
| `README.md` | New architecture diagram, updated quick start, project structure |
| `TECH_STACK.md` | Split into overview, references FRONTEND.md and BACKEND.md |
| `DATA_MODELS.md` | Added Pydantic models, updated storage strategy |
| `API_PROMPTS.md` | Refocused on prompt templates only, removed API call logic |
| `PAGES_AND_FLOWS.md` | Updated to reference backend API calls |

### Unchanged Files

| File | Reason |
|------|--------|
| `UI_DESIGN.md` | Pure UI specification, no architecture dependency |

---

## Detailed Changes

### README.md

1. **Added**: Architecture diagram showing frontend-backend separation
2. **Updated**: Project structure to show `frontend/` and `backend/` directories
3. **Updated**: Quick start commands for both frontend and backend
4. **Added**: Development workflow section
5. **Updated**: Deployment section for separate frontend/backend hosting

### TECH_STACK.md

1. **Restructured**: Now serves as an overview document
2. **Extracted**: Frontend details to `FRONTEND.md`
3. **Extracted**: Backend details to `BACKEND.md`
4. **Added**: Architecture decision rationale

### DATA_MODELS.md

1. **Added**: Pydantic model definitions for backend
2. **Updated**: Storage strategy section
   - localStorage: UI drafts only
   - Backend: All generated data (menu books, shopping lists)
3. **Added**: API request/response format section
4. **Maintained**: TypeScript interfaces for frontend (unchanged)

### API_PROMPTS.md

1. **Removed**: API call logic (moved to BACKEND.md)
2. **Removed**: Response parsing code (now in backend)
3. **Focused**: Pure prompt templates only
4. **Added**: Prompt versioning notes

### API_SPEC.md (New)

1. **Added**: Complete REST API specification
2. **Added**: Endpoint definitions with request/response schemas
3. **Added**: Error response format
4. **Added**: Authentication notes (for future)

### BACKEND.md (New)

1. **Added**: Python FastAPI project structure
2. **Added**: Gemini service implementation guide
3. **Added**: Pydantic validation patterns
4. **Added**: Testing guide
5. **Added**: Deployment options (Railway, Render, Fly.io)

### FRONTEND.md (New)

1. **Extracted**: React/Vite configuration from TECH_STACK.md
2. **Updated**: API service to call backend instead of Gemini directly
3. **Added**: Mock data strategy for development
4. **Updated**: State management (UI state only)

### PAGES_AND_FLOWS.md

1. **Updated**: Step 7 (Generating) to reference backend API
2. **Updated**: Step 10 (Shopping List) to reference backend API
3. **Updated**: Background generation to use backend polling
4. **Added**: API error handling UI states

---

## Migration Notes

### For Development

1. Backend must be running before frontend can generate plans
2. Use mock data for frontend-only development
3. Test API endpoints independently with curl/Postman

### Environment Variables

**Backend (.env)**
```
GEMINI_API_KEY=your_key_here
CORS_ORIGINS=http://localhost:5173
```

**Frontend (.env.local)**
```
VITE_API_BASE_URL=http://localhost:8000
```

### Breaking Changes

1. Frontend no longer calls Gemini API directly
2. `VITE_GEMINI_API_KEY` is removed from frontend
3. IndexedDB storage is replaced by backend persistence

---

## File Structure Comparison

### Before (v1)
```
omenu/
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   ├── stores/
│   ├── services/
│   │   └── gemini.ts      # Direct Gemini calls
│   ├── types/
│   └── utils/
├── docs/
└── package.json
```

### After (v2)
```
omenu/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── stores/        # UI state only
│   │   ├── services/
│   │   │   └── api.ts     # Calls backend API
│   │   ├── types/
│   │   └── utils/
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── routers/
│   │   ├── services/
│   │   │   └── gemini.py  # Gemini integration
│   │   └── models/
│   ├── tests/
│   └── requirements.txt
│
└── docs/
```