# Prague Tracker

A personal health and lifestyle tracking app for 30-day challenges. Track workouts, reading, nutrition, sleep, and more with seamless cross-device synchronization.

## ✨ Features

### 📱 **Progressive Web App (PWA)**
- Install on mobile and desktop
- Offline functionality
- Background sync
- Native app-like experience

### 🎯 **Comprehensive Tracking**
- **Fitness**: Strength workouts, cardio, activity minutes
- **Wellness**: Sleep hours, weight, body fat percentage
- **Habits**: Daily reading, supplement tracking
- **Nutrition**: Calorie logging with trends
- **Productivity**: Work blockers, family time
- **Lifestyle**: Dog training, weekly goals

### 🔄 **Cross-Device Sync**
- Anonymous session management
- QR code pairing between devices
- Real-time synchronization via Supabase
- Offline-first with sync queue

### 📊 **Analytics & Insights**
- Progress dashboard with habit streaks
- Interactive charts for body metrics
- Calendar view with completion indicators
- Weekly and monthly goal tracking
- Export/import functionality

### ♿ **Accessibility & UX**
- Fully responsive design
- Screen reader support
- Keyboard navigation
- High contrast focus indicators
- Smooth animations and transitions

## 🚀 Quick Start

### Development Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up Supabase**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   - Visit `http://localhost:5173`
   - Create a new challenge session
   - Start tracking your progress!

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling framework
- **React Router** - Client-side routing
- **Recharts** - Data visualization

### State Management
- **Zustand** - Lightweight state management
- **React Hooks** - Local component state
- **Optimistic Updates** - Instant UI feedback

### Backend & Sync
- **Supabase** - Backend as a Service
- **PostgreSQL** - Database
- **Real-time subscriptions** - Live sync
- **Row Level Security** - Data isolation

### PWA Features
- **Service Worker** - Offline caching
- **Web App Manifest** - Installation
- **Background Sync** - Offline queue

## 🚀 Deployment

See [DEPLOYMENT.md](../DEPLOYMENT.md) for detailed deployment instructions on Vercel.

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/               # Main application pages
├── hooks/               # Custom React hooks
├── stores/              # Zustand state stores
├── utils/               # Utility functions
└── lib/                 # Core libraries
```

## 🔧 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

## 📱 PWA Installation

The app can be installed on any device that supports PWAs:
- **Desktop**: Install via browser prompt
- **iOS**: Add to Home Screen via Safari
- **Android**: Install via Chrome menu

## 🔐 Privacy & Security

- **No Personal Data**: Anonymous sessions only
- **Local Storage**: Data cached locally for offline use
- **Encryption**: All data encrypted in transit (HTTPS)
- **No Tracking**: No analytics or third-party trackers

## 📊 Performance

- **Bundle Size**: 865KB (249KB gzipped)
- **Lighthouse Score**: 95+ across all metrics
- **Offline Ready**: Full functionality without network

---

**Prague Tracker** - Transform your health habits, one day at a time. 🚀
