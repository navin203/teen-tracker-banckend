# TeenTrack – Smart Teen Expense Tracker 🚀

TeenTrack is a modern, responsive full-stack expense tracking and financial literacy application designed specifically for teenagers and students.

## ✨ Features

- **📊 Visual Dashboard**: Track monthly pocket money, real-time spending progress, and interactive category breakdowns.
- **💸 Expense Management**: Add, edit, filter, and categorize daily expenses with payment methods (Cash, UPI, Cards).
- **🎯 Budgets & Limits**: Set monthly category spending caps with visual warnings when exceeding thresholds.
- **💡 Smart Insights**: Automated financial tips and spending pattern analytics.
- **🔒 Secure Authentication**: Powered by Supabase Auth with Row Level Security (RLS) data isolation.
- **🎨 Modern Dark/Light Theme**: Built with Tailwind CSS, smooth animations, and glassmorphism UI.

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Recharts, Axios
- **Backend**: Node.js, Express.js (MVC Architecture), Helmet, CORS, Rate Limiting
- **Database & Auth**: Supabase PostgreSQL with Row Level Security (RLS)

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 2. Environment Variables
Configure `.env` files in `backend/` and `frontend/`:

**Backend (`backend/.env`):**
```env
PORT=5000
NODE_ENV=development
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
CORS_ORIGIN=http://localhost:5173
```

**Frontend (`frontend/.env`):**
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:5000
```

### 3. Run Locally
```bash
# Start backend
cd backend
npm install
npm run dev

# Start frontend
cd ../frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173` and Backend at `http://localhost:5000`.
