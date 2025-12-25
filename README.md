# UluCore

Action Decision Engine with AI Advisory - A production-ready SaaS backend platform.

## Features

- **Action Decision Engine**: Submit actions via API and receive approve/reject decisions
- **Deterministic Policy Engine**: Rule-based decision making
- **AI Advisory (Fail-Safe)**: AI recommendations that never block the system
- **Immutable Audit Logging**: Append-only event logs
- **JWT + API Key Authentication**: Secure access control
- **Metrics Aggregation**: Track actions, approvals, rejections

## Tech Stack

### Backend
- FastAPI
- Python 3.12
- JWT Authentication
- In-memory database (MVP)

### Frontend
- React + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui components

## Deployment

### Backend (Render)

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set the following:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install poetry && poetry install`
   - **Start Command**: `poetry run uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables:
   - `JWT_SECRET`: Your secret key
   - `ENV`: `production`
   - `AI_API_KEY`: Your Grok/xAI API key (optional)

### Frontend (Vercel)

1. Import your GitHub repository on Vercel
2. Set the following:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
3. Add environment variables:
   - `VITE_API_URL`: Your Render backend URL

## API Endpoints

- `POST /auth/signup` - Create account
- `POST /auth/login` - Login
- `POST /action` - Submit action for decision (API Key required)
- `GET /events` - Get audit logs (JWT required)
- `GET /metrics` - Get metrics (JWT required)
- `POST /api-keys` - Create API key (JWT required)
- `GET /billing/plans` - Get pricing plans
- `GET /health` - Health check

## Local Development

### Backend
```bash
cd backend
poetry install
poetry run fastapi dev app/main.py
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## License

MIT
