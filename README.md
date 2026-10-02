# Teacher Jobs UZ

O'zbekistondagi o'qituvchilar uchun vakansiyalar platformasi MVP (Next.js 16 + Express.js + Supabase + AI Matching).

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/Akhrorbek2023/teacher-jobs-uz)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Akhrorbek2023/teacher-jobs-uz)

## 🚀 Cloud Deployment

### 1. Backend (Render.com)
1. [Render.com](https://dashboard.render.com/) ga kiring va **New → Blueprint** yoki [ushbu havola orqali](https://render.com/deploy?repo=https://github.com/Akhrorbek2023/teacher-jobs-uz) oching.
2. `Akhrorbek2023/teacher-jobs-uz` reposini tanlang.
3. Loyihadagi `render.yaml` fayli barcha sozlamalarni avtomatik o‘qiydi (`rootDir: backend`, Node.js).
4. Environment variables bo‘limida Supabase kalitlaringizni kiriting:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY` (ixtiyoriy)
   - `TELEGRAM_BOT_TOKEN` (ixtiyoriy)
5. **Apply** tugmasini bosing. Sizga `https://teacher-jobs-uz-api.onrender.com` kabi bepul HTTPS havola beriladi.

### 2. Frontend (Netlify)
1. [Netlify](https://app.netlify.com/) ga kiring va **Add new site → Import an existing project** ni tanlang (yoki yuqoridagi **Deploy to Netlify** tugmasini bosing).
2. GitHub orqali `Akhrorbek2023/teacher-jobs-uz` reposini tanlang.
3. Loyihadagi `netlify.toml` fayli avtomatik aniqlanadi:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `.next`
4. Environment variables ga quyidagilarni kiriting:
   - `NEXT_PUBLIC_SUPABASE_URL`: Supabase loyihangiz URL manzili
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: Supabase anon/publishable kaliti
   - `NEXT_PUBLIC_API_URL`: Render'da yaratilgan backend havolangiz (masalan, `https://teacher-jobs-uz-api.onrender.com`)
5. **Deploy Site** tugmasini bosing.

---



## Stack
- Frontend: Next.js 16, JavaScript, Tailwind CSS
- Backend: Express.js
- Database/Auth/Storage: Supabase PostgreSQL
- AI: OpenAI Responses API (backend-only)
- Notifications: Telegram Bot API
- Security: Supabase RLS + backend validation

## Project structure
- `frontend/` — Next.js web app
- `backend/` — Express REST API, AI service and Telegram bot
- `supabase/schema.sql` — database schema, indexes, triggers and RLS
- `.env.example` — all required environment variables

## Run

### 1. Supabase
Create a Supabase project and run `supabase/schema.sql` in SQL Editor.

In Supabase Auth:
- Enable Email/Password.
- Enable Google OAuth if desired.
- Add your frontend URL to redirect URLs, e.g. `http://localhost:3000/auth/callback`.

Create a Storage bucket named `avatars` (public is acceptable for MVP).

### 2. Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### 3. Frontend
```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Open http://localhost:3000

## AI
Set `OPENAI_API_KEY` in backend `.env`. The key never goes to the browser.
The endpoint `POST /api/ai/match` accepts a teacher profile and a list of vacancies and returns structured match explanations.

## Telegram
Create a bot with BotFather, then set `TELEGRAM_BOT_TOKEN` and run:
```bash
npm run bot
```

Users can send `/start`, then `/profile`, `/jobs`, or `/help`.

## Demo API
- `GET /api/health`
- `GET /api/vacancies`
- `GET /api/vacancies/:id`
- `POST /api/vacancies`
- `POST /api/ai/match`
- `GET /api/companies/:id`

## Important
This is a production-oriented MVP scaffold. Before public launch, add:
- email verification
- rate limiting with Redis
- CAPTCHA/anti-spam
- server-side admin role management
- source-specific vacancy parsers with each site's terms/robots requirements
- background job queue for aggregation
- monitoring and error tracking
