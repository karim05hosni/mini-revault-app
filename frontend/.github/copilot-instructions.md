# Copilot Instructions for mini-revault-app Frontend

## Project Overview
- This is a React + TypeScript frontend for a cryptocurrency wallet/banking app.
- Uses Vite for build tooling and Tailwind CSS for styling.
- Main features: user authentication, wallet management, deposit/withdraw/transfer, transaction history, and analytics.

## Architecture & Key Patterns
- **Component Structure:**
  - All UI components are in `src/components/` (e.g., `WalletCard`, `DepositForm`).
  - Page-level containers are in `src/pages/` (e.g., `Dashboard`, `Login`).
  - Context providers (e.g., `AuthContext`) are in `src/context/`.
  - API calls are centralized in `src/services/api.ts`.
  - Types are defined in `src/types/`.
- **Routing:**
  - Client-side routing is handled in `App.tsx`.
  - Protected routes use the `ProtectedRoute` component.
- **State Management:**
  - Uses React Context for authentication and possibly other global state.
- **Styling:**
  - Tailwind CSS is configured via `tailwind.config.js` and used throughout components.

## Developer Workflows
- **Install dependencies:**
  - `npm install`
- **Start development server:**
  - `npm run dev`
- **Build for production:**
  - `npm run build`
- **Preview production build:**
  - `npm run preview`
- **No test scripts are present by default.**

## Conventions & Patterns
- **API Integration:**
  - All backend API calls go through `src/services/api.ts`.
  - Use async/await and handle errors at the call site.
- **Component Design:**
  - Prefer functional components and hooks.
  - Use Tailwind utility classes for styling; avoid custom CSS unless necessary.
- **Type Safety:**
  - Define and import types from `src/types/`.
- **Authentication:**
  - Use `AuthContext` for user state and authentication logic.
- **Protected Routes:**
  - Wrap sensitive pages with `ProtectedRoute`.

## Integration Points
- **Backend API:**
  - All data is fetched via HTTP requests in `api.ts`.
- **Nginx & Docker:**
  - Production deployment uses `nginx.conf` and `Dockerfile`.

## Examples
- See `src/pages/Dashboard.tsx` for a typical page layout and data flow.
- See `src/components/DepositForm.tsx` for form handling and API usage.
- See `src/context/AuthContext.tsx` for authentication logic.

---

For questions or unclear patterns, review the referenced files or ask for clarification.