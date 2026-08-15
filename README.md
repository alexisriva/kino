# 🎬 KINO — Cinema & Media Review Journal

> A curated personal media journal for movies, TV series, documentaries, and anime. Built with Next.js 16, React 19, Tailwind CSS, Prisma ORM, and SQLite, following a sophisticated, editorial **"Cinematic Journal"** design system.

---

## 🌟 Key Features

### 📖 Editorial Journal & Reviews
- **Rich Media Cards**: Displays custom star ratings (0.5 to 5.0 scale), IMDb ratings, release years, directors, cast members, plot summaries, and full editorial reviews.
- **Featured Spotlight Hero**: Highlights a pinned centerpiece entry on the homepage with review excerpts and prominent calls-to-action.
- **Deep Routing (`/post/[slug]`)**: Dedicated permalink pages for each review with complete metadata and contextual back navigation.

### 🔍 Discovery, Search & Sorting
- **Category Tabs**: Filter between **All Media**, **Movies**, **TV Series**, **Documentaries**, and **Anime**.
- **Live Search**: Instant filtering across titles, directors, cast members, and review content.
- **Tag Cloud**: Multi-tag filtering system with interactive tag toggle and active filter indicators.
- **Persistent Sorting**: Sort by *Latest*, *Oldest*, *Highest Rating*, or *Most Likes* with automatic `localStorage` preference persistence.

### 📌 Interactive Watchlist (`/watchlist`)
- **Queue vs. Watched**: Separate tabs for queued items and logged media.
- **Log & Review Flow**: Seamlessly transition a queued watchlist item into a full published review journal entry.
- **Add to Watchlist**: Quick-entry modal for saving future watches.

### 🍿 OMDb API Metadata Autofill
- Integrated with the **OMDb API** to search and automatically populate movie/series posters, director, cast, genres, plot summaries, and IMDb ratings during entry creation.

### ❤️ Social Voting & Sharing
- **Anonymous Voting**: Device-token-based Like and Dislike reactions with duplicate vote prevention.
- **Confetti Micro-interactions**: Celebratory particle bursts on positive likes powered by `canvas-confetti`.
- **Social Sharing**: Native Web Share API integration with fallback custom share modal, one-click link copying, and direct X (Twitter) posting.

### 🔒 Admin Mode & Management
- **Secure Authentication**: Password-protected admin access using JSON Web Tokens (JWT) powered by `jose`.
- **In-Place CRUD**: Create, edit, and delete entries directly from cards and headers without navigating away.

### 📽️ Custom Cinematic 404 Experience
- Custom themed `Scene Not Found` page styled with the editorial palette and navigation back to the homepage.

---

## 🎨 Design System: "Cinematic Journal"

KINO uses an intentional, dark atmospheric palette designed to evoke the feeling of a prestigious film publication or theater environment:

| Token | Hex / Value | Description |
| :--- | :--- | :--- |
| **Base Surface** | `#121315` | Deep Onyx foundation canvas |
| **Surface Containers** | `#1b1c1e` / `#292a2c` | Subtle tonal layers replacing heavy drop shadows |
| **Primary Gold** | `#f2ca50` | Muted gold used for calls-to-action, star ratings, and badges |
| **Typography (Headlines)** | `Manrope` | Geometric, modern sans-serif for film titles and headers |
| **Typography (Body)** | `Newsreader` | Literary serif for long-form review copy and journal entries |
| **Typography (Labels)** | `Hanken Grotesk` | High-legibility metadata, buttons, and navigation |

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/) + [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database & ORM**: [SQLite](https://www.sqlite.org/) + [Prisma ORM](https://www.prisma.io/) (`@prisma/adapter-better-sqlite3`, `better-sqlite3`)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + [Lucide React Icons](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/) + [Canvas Confetti](https://github.com/catdad/canvas-confetti)
- **Security & Auth**: [jose](https://github.com/panva/jose) (JWT)
- **Testing**: [Vitest](https://vitest.dev/) + [@testing-library/react](https://testing-library.com/) + V8 Coverage (>90% threshold enforcement)
- **Git Hooks**: [Husky](https://typicode.github.io/husky/) pre-commit automated test runner

---

## 📂 Project Structure

```text
├── prisma/
│   ├── dev.db               # Local SQLite database
│   ├── schema.prisma        # Prisma data models (Post, Vote, WatchlistItem)
│   └── seed.ts              # Database seeding script with starter reviews
├── src/
│   ├── actions/             # Next.js Server Actions (postActions, watchlistActions)
│   ├── app/                 # Next.js App Router
│   │   ├── api/             # API routes (admin auth, omdb search)
│   │   ├── post/[slug]/     # Dynamic post detail page
│   │   ├── watchlist/       # Watchlist management page
│   │   ├── layout.tsx       # Global root layout & meta tags
│   │   ├── not-found.tsx    # Custom 404 Not Found page
│   │   └── page.tsx         # Homepage (Media grid, hero spotlight, filters)
│   ├── components/          # Reusable UI components
│   │   ├── __tests__/       # Component unit test suites
│   │   ├── AddWatchlistModal.tsx
│   │   ├── AdminModal.tsx
│   │   ├── Header.tsx
│   │   ├── HeroBanner.tsx
│   │   ├── LikeDislikeButtons.tsx
│   │   ├── MediaCard.tsx
│   │   ├── MediaGrid.tsx
│   │   ├── ShareModal.tsx
│   │   ├── StarRating.tsx
│   │   ├── WatchlistCard.tsx
│   │   └── WatchlistGrid.tsx
│   └── lib/                 # Core utilities (auth, prisma client, device tokens)
├── vitest.config.mts        # Vitest test configuration & coverage thresholds
└── vitest-setup.ts          # Test environment mocks (Next.js navigation & image)
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** 20+ installed
- **npm**, **pnpm**, or **yarn**

### 2. Environment Setup
Create a `.env` file in the root directory (or use the existing one):

```env
DATABASE_URL="file:./prisma/dev.db"
ADMIN_SECRET_KEY="your-admin-password"
JWT_SECRET="your-secret-jwt-token"
OMDB_API_KEY="your-omdb-api-key" # Optional, enables OMDb auto-complete
```

### 3. Install Dependencies & Seed Database
```bash
npm install
npx tsx prisma/seed.ts
```

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view KINO.

---

## 🧪 Testing & Code Quality

The repository includes a comprehensive unit test suite with strict coverage enforcement:

```bash
# Run all unit tests with code coverage analysis
npm run test

# Run ESLint linter
npm run lint

# Production build check
npm run build
```

- **Pre-commit Hook**: Automatically executes unit tests before allowing git commits via Husky.
- **Coverage Gate**: Enforces a minimum **90% coverage threshold** across statements, branches, functions, and lines on all components.

---

## 📄 License
This project is open source and available under the [Apache-2.0 License](LICENSE).
