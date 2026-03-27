# MailFlow AI - Frontend

MailFlow AI is a premium, AI-powered cold email outreach platform. The frontend is a modern React application built with TypeScript and Vite, featuring a sophisticated Slate & Blue design system.

## 🚀 Key Features

- **AI-Powered Outreach**: Generate high-converting email drafts and lead lists using Gemini AI.
- **Campaign Management**: Full lifecycle management for bulk email sequences with CSV import support.
- **Real-time Analytics**: Built-in monitoring for email opens and delivery performance.
- **Dynamic Templates**: Automatic detection and replacement of `{{placeholders}}`.
- **Premium UX**: Modern Slate & Blue design system with live HTML previews.

## 🛠 Tech Stack

- **Framework**: React 18+ (Vite, TypeScript)
- **Styling**: Vanilla CSS (Modern Design System)
- **State Management**: React Context API
- **Routing**: React Router DOM v6

## 📁 Project Structure

- `src/components/`: Reusable UI primitives.
- `src/context/`: Global providers for Toast, Confirm, and Loading systems.
- `src/pages/`: Main application views (Home, Campaigns, Dashboard).
- `src/services/`: Centralized API client.
- `src/utils/`: Shared helper functions.

## 🏁 Getting Started

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Configure Environment**:
    Create a `.env` file in the `frontend` directory:
    ```env
    VITE_API_BASE_URL=http://localhost:5000
    ```

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```

4.  **Build for Production**:
    ```bash
    npm run build
    ```

## 🎨 Design System

The application uses a unified color palette defined in `src/index.css`:
- **Primary**: Slate 900 (`#0f172a`)
- **Accent**: Royal Blue (`#2563eb`)
- **Success**: Emerald 600 (`#059669`)
- **Danger**: Rose 600 (`#e11d48`)

---
*Built for professional outreach and modern sales workflows.*
