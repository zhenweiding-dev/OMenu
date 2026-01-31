# OMenu - AI-Powered Meal Planning App

An intelligent weekly meal planning app that uses Google Gemini AI to generate personalized meal plans and shopping lists.

## Features

- 🍳 **AI Meal Planning**: Generate weekly meal plans based on your preferences
- 🛒 **Smart Shopping Lists**: Auto-generated shopping lists organized by category
- ⚙️ **Customizable Preferences**: Keywords, must-have items, dietary restrictions
- 📅 **Flexible Scheduling**: Choose which meals to plan for each day
- 💾 **Local Storage**: Plans saved locally with IndexedDB

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS (custom design system)
- **State**: Zustand
- **Storage**: localStorage + IndexedDB
- **AI**: Google Gemini 1.5 Flash
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Gemini API Key ([Get one here](https://aistudio.google.com/apikey))

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd omenu

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your VITE_GEMINI_API_KEY

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file in the root directory:

```
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

## Project Structure

```
omenu/
├── public/
│   └── icons/
├── src/
│   ├── components/
│   │   ├── common/      # Reusable UI components
│   │   ├── create/      # Create flow step components
│   │   └── layout/      # Layout components
│   ├── pages/           # Page components
│   ├── services/        # API and storage services
│   ├── stores/          # Zustand state stores
│   ├── types/           # TypeScript interfaces
│   ├── utils/           # Constants and helpers
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── vercel.json
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repo to Vercel
2. Add `VITE_GEMINI_API_KEY` to environment variables
3. Deploy

### Manual

```bash
npm run build
# Deploy the 'dist' folder to your hosting provider
```

## License

MIT
