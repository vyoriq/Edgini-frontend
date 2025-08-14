# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Mandatory Guidelines for Claude to start any task

Always start by studying my entire codebase and identifying the impacted files.

1. Always ask for a ticket nummber before working
2. Look for a file with that ticket number inside the tasks folder. If it exists read that file to build your context of previous work done under that ticket
3. If a folder with that ticket number inside the tasks folder does not exist then create the folder with the ticket number.Add the file inside that folder which relates to that ticket number and ensure that there is only 1 .md file for reach ticket keep appending to the same file instead of making multiple files. If the tasks folder does not exist create the tasks folder at root level.
4. Always start a task by acting like a very senior developer
5. Always create a plan first with detailed steps and tasks you will be undertaking and keep this in the ticket number file
6. The plan you create should also include steps being taken for security and VAPT adherence.
7. Always ask me to review and signoff the plan before starting
8. As you make progress you need to tick off the tasks as you complete them in the ticket number file
9. Keep the ticket number file uptodate with a detailed history of all tasks and steps undertaken. Also ensure you include the names of all the files you change for the ticket.
10. This file should have all the detiails you need if you were to restart this task at a later point
11. Follow project naming conventions and style rules strictly.
12. Avoid hardcoding values — use centralized constants/configs.
13. Cover all the edge cases while developing the function. For every function that you create or update ensure a comment is added above the function explaining the functionality
14. Whenever developing a new function and you need to install a third party library/package, ask me before installing.
15. Always use security Best Practices and industry standard code and ensure code written will pass VAPT tests.



## Development Commands

- `npm run dev` - Start the development server with hot reload
- `npm run build` - Build the production bundle to `/dist`
- `npm run preview` - Preview the production build locally

## Project Architecture

This is a React 18 + Vite frontend application for Edgini, an educational platform. The application uses modern React patterns with functional components and hooks.

### Core Technologies
- **Framework**: React 18 with Vite as the build tool
- **Styling**: Tailwind CSS for utility-first styling
- **Routing**: React Router DOM v6 for client-side routing
- **Authentication**: Supabase for user authentication and database
- **Internationalization**: i18next with react-i18next for multi-language support
- **Icons**: React Icons library

### Key Architecture Patterns

**Routing Structure**: The app uses a single-page application (SPA) pattern with these main routes:
- `/` - Homepage with language selection and welcome content
- `/auth` - Authentication page
- `/auth/callback` - OAuth callback handler
- `/onboarding` - User onboarding flow
- `/learn` - Learning interface
- `/subscription` - Subscription plans page

**Authentication Flow**: Uses Supabase client configured in `src/lib/supabaseClient.jsx` with:
- Persistent sessions enabled
- Auto token refresh
- URL-based session detection for OAuth callbacks

**Internationalization**: Multi-language support with 6 languages (en, hi, bn, ar, es, kn):
- Translation files in `/public/locales/{lang}/translation.json`
- Language detection via browser/localStorage
- Custom language switching in components (not fully migrated to i18next yet)

**State Management**: Uses React's built-in state management:
- Local component state with `useState`
- Side effects with `useEffect`
- Navigation with `useNavigate` from React Router

### Environment Configuration

The app requires these environment variables in `.env`:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

### Development Server Configuration

Vite dev server includes proxy configuration for local API development:
- `/curate` routes proxy to `http://127.0.0.1:8000` (FastAPI backend)

### Build Configuration

- **Output**: `dist/` directory
- **Assets**: `dist/assets/` for static files
- **Base Path**: Configured for root deployment (`/`)
- **Import Alias**: `@/` maps to `src/` directory

### Component Architecture

Components are organized by feature:
- `Homepage.jsx` - Landing page with multi-language greetings
- `AuthPage.jsx` - Authentication interface
- `AuthCallback.jsx` - OAuth callback handler
- `OnboardingPage.jsx` - User onboarding flow
- `LearnPage.jsx` - Main learning interface
- `SubscriptionPage.jsx` - Subscription management
- `PlanCard.jsx` - Reusable subscription plan card component

### Styling Patterns

Uses Tailwind CSS with common patterns:
- Gradient backgrounds (`bg-gradient-to-br from-blue-900 to-blue-600`)
- Responsive utilities (`md:text-2xl`, `sm:px-6`, etc.)
- Flexbox layouts for centering and spacing
- Custom component styling over global CSS

### API Integration

- **Supabase**: Database and authentication via `@supabase/supabase-js`
- **Custom API**: `/curate` endpoint for content curation (proxied during development)

### Asset Management

Static assets are served from `/public/assets/` and `/public/` with logo files for the Edgini brand.