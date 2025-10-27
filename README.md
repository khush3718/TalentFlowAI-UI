# Resume Scanner UI

This is a Next.js application that provides a user interface for the AI-Powered Resume Screening & ATS Scoring System.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)

## Project Structure

- `app/`: Contains the main application pages and layouts.
  - `(main)/`: Main application routes.
    - `candidates/`: Page to view and manage candidates.
    - `history/`: Page to view scan history.
    - `results/`: Page to display analysis results.
    - `scan/`: The main page for uploading resumes and initiating scans.
    - `settings/`: Page for application settings.
  - `globals.css`: Global stylesheets.
  - `layout.tsx`: The root layout for the application.
- `components/`: Reusable React components.
  - `ui/`: Components from shadcn/ui.
  - `site-header.tsx`: The main site header.
  - `site-footer.tsx`: The main site footer.
- `hooks/`: Custom React hooks.
- `lib/`: Utility functions.
- `public/`: Static assets like images and fonts.
- `styles/`: Global styles.
- `next.config.mjs`: Next.js configuration.
- `postcss.config.mjs`: PostCSS configuration for Tailwind CSS.
- `tsconfig.json`: TypeScript configuration.
- `package.json`: Project dependencies and scripts.

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm, yarn, or pnpm

### Installation

1. **Clone the repository** (if you haven't already).

2. **Navigate to the `UI` directory**:
   ```bash
   cd UI
   ```

3. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

### Running the Development Server

1. **Start the development server**:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

2. **Open your browser** and navigate to [http://localhost:3000](http://localhost:3000).

### Building for Production

To create a production-ready build, run:

```bash
npm run build
# or
yarn build
# or
pnpm build
```

This will create an optimized build in the `.next` directory.

## Available Scripts

- `dev`: Runs the application in development mode.
- `build`: Creates a production build.
- `start`: Starts a production server.
- `lint`: Lints the codebase using ESLint.
