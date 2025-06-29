# TrackSlip - AI-Powered Expense Tracker

![TrackSlip Logo](/public/logo.png)

Track your expenses, gain insights, and manage your finances with AI-powered analytics. Built with React, TypeScript, and Supabase.

## ✨ Features

- **User Authentication**
  - Email/Password Sign Up & Login
  - Phone Number Verification
  - Secure Session Management

- **Expense Tracking**
  - 📝 Add expenses with details
  - 📸 Receipt image uploads
  - 🏷️ Categorization
  - 💰 Multi-currency support

- **AI Insights**
  - Smart expense categorization
  - Spending analytics
  - Budget tracking
  - Custom reports

## 📱 Screenshots

| Capture | Extract | Manage |
|--------|--------|--------|
| ![Capture](/public/images/2.png) | ![Extract](/public/images/4.png) | ![Manage](/public/images/1.png) | 



## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/trustedprince01/trackslip.git
   cd trackslip
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Set up environment variables:
   Create a `.env` file:
   ```
    let supabaseURL = "YOUR_SUPABASE_URL"
    let supabaseAnonKey = "YOUR_SUPABASE_ANON_KEY"
    let supabaseServiceRoleKey = "YOUR_SUPABASE_SERVICE_ROLE_KEY"
    let geminiAPIKey = "YOUR_GEMINI_API_KEY"
    let secretKey = "YOUR_SECRET_BACKEND_KEY"
    let imgBBAPIKey = "YOUR_IMGBB_API_KEY"
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (Auth, Database, Storage)
- **UI**: Shadcn UI Components
- **State Management**: React Query
- **Build Tool**: Vite

## 📂 Project Structure

```
src/
├── components/     # Reusable UI components
├── contexts/       # React contexts
├── hooks/          # Custom React hooks
├── lib/            # Utility functions
├── pages/          # Page components
├── service/        # API services
└── types/          # TypeScript type definitions
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📄 License

MIT
