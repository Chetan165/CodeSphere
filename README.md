# CodeSphere

CodeSphere is a college-level coding contest platform. It gives students a focused place to discover contests, solve programming problems in the browser, submit solutions, and review judging results. The platform also includes authentication, user dashboards, contest administration, problem administration, and contest management workflows.

This repository contains the CodeSphere frontend application. It is designed to work with the CodeSphere backend API for authentication, contests, problems, submissions, and judging.

## Highlights

- Landing page with login and registration entry points
- User authentication and protected dashboard views
- Contest browsing, contest details, and contest challenge navigation
- Problem-solving workspace with a full-height Monaco code editor
- C++, Java, and Python editor support with language-specific boilerplate
- Run and submit actions with asynchronous submission polling
- Judge result states for accepted, failed, and runtime/error responses
- Markdown, GitHub Flavored Markdown, and KaTeX rendering for problem statements
- Drag-and-drop file upload components and submission code viewing utilities
- Admin-facing contest and problem management screens
- Responsive layouts for desktop and smaller screens
- Animated interface components, backgrounds, loaders, and buttons inspired by Aceternity UI

## Frontend Technology

- **React 19** for the component-based user interface
- **Vite** for development, bundling, and hot module replacement
- **React Router** for client-side navigation
- **Tailwind CSS** for utility-first responsive styling
- **Monaco Editor** via `@monaco-editor/react` for the in-browser coding experience
- **Aceternity UI patterns** implemented as reusable local components such as wavy backgrounds, noise backgrounds, typewriter effects, encrypted text, loaders, and animated buttons
- **Radix UI** for accessible primitives such as dialogs and labels
- **Lucide** and **Tabler Icons** for interface icons
- **Motion** for interaction and transition effects
- **React Markdown**, `remark-gfm`, and **KaTeX** for rich problem content and mathematical notation
- **React Hot Toast** and **React Toastify** for user feedback

## Project Structure

```text
src/
├── App.jsx                  # Landing page and session-aware entry actions
├── Dashboard.jsx            # Authenticated user dashboard
├── SolvePage.jsx            # Problem-solving workspace and Monaco editor
├── Contest.jsx              # Contest listing and contest views
├── ContestChallenges.jsx    # Challenges belonging to a contest
├── Contest_admin.jsx        # Contest administration
├── Problem_admin.jsx        # Problem administration
├── PollingSubmissions.jsx   # Submission and judge-status polling
├── UserAuth.jsx             # Client-side authentication/session helper
├── component/
│   ├── elements/            # Small shared controls and loaders
│   └── ui/                  # Reusable animated and Aceternity-inspired UI
├── Context/                 # Shared React context modules
├── Pages/                   # Additional page-level screens
└── utils/                   # Class-name and Markdown utilities
```

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm
- A running CodeSphere backend API for login, contest data, and judging workflows

### Installation

```bash
npm install
```

Create a `.env` file in the project root when the backend is not running on the default address:

```env
VITE_BACKEND_URL=http://localhost:3000
```

The frontend falls back to `http://localhost:3000` when `VITE_BACKEND_URL` is not defined.

### Run the development server

```bash
npm run dev
```

Vite will print the local development URL, usually `http://localhost:5173`.

### Production build and preview

```bash
npm run build
npm run preview
```

### Lint the project

```bash
npm run lint
```

## Solving Workflow

1. Sign in or create an account.
2. Open the dashboard and choose a contest.
3. Select a challenge to open the solve page.
4. Read the Markdown problem statement, examples, constraints, and rendered formulas.
5. Choose a supported language and write code in Monaco Editor.
6. Run code or submit it to the judge service.
7. Follow the submission status and inspect the returned result.

The solve page keeps language-specific code buffers and supplies starter templates for supported languages. Submission status is refreshed through the polling helpers in `PollingSubmissions.jsx`.

## Configuration and Backend Contract

The frontend communicates with the backend through `VITE_BACKEND_URL`. The API is responsible for session handling, contest and problem data, and code execution/judging. Browser requests use credentials where required, so the backend must be configured for the frontend origin and cross-origin credentials in local development.

This repository does not include the backend service or judge infrastructure. Make sure those services are available before testing authenticated flows or running submissions.

## Development Notes

- Keep reusable interface work in `src/component/ui` or `src/component/elements`.
- Prefer the existing Tailwind, Radix, Lucide, and local UI patterns when extending screens.
- Keep problem-content rendering scoped to the existing Markdown styles so code samples and KaTeX remain readable.
- Do not commit secrets or local `.env` files.
