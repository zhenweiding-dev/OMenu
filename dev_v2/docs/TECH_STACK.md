# OMenu 技术栈（v2）

> 备注：本文术语已统一为 Menu Book（原 Meal Plan）。

## Frontend
- **Framework**: React 18.3
- **Router**: react-router-dom 6.28
- **Build**: Vite 7.2
- **State**: Zustand 4.5
- **Styling**: TailwindCSS 3.4 + CVA
- **Icons**: lucide-react
- **Dates**: date-fns 4.1
- **Testing**: Vitest + Testing Library

**主要脚本（frontend/package.json）**
- `npm run dev`
- `npm run build`
- `npm run test`
- `npm run lint`

## Backend
- **Framework**: FastAPI >=0.109
- **Server**: Uvicorn >=0.27
- **Models**: Pydantic v2 + pydantic-settings
- **AI**: google-genai (Gemini SDK)
- **Concurrency**: anyio
- **Testing**: pytest + pytest-asyncio + httpx

## 运行环境
- **Node**: 18+
- **Python**: 3.10+（本地测试 3.13）

## 环境变量
**Backend (`dev_v2/backend/.env`)**
```
GEMINI_API_KEY=...
CORS_ORIGINS=http://localhost:5174
```

**Frontend (`dev_v2/frontend/.env.local`)**
```
VITE_API_BASE_URL=http://localhost:8000
VITE_USE_MOCK=false
```
