# Contribution Guide - War Takjil

Thank you for your interest in contributing to **War Takjil**! This guide will help you understand our project structure, technology stack, and coding conventions so you can contribute effectively.

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (Runtime & Package Manager)
- Node.js (v18+ recommended)
- Firebase Project Setup
- Clerk Account
- Cloudinary Account

### Installation

1. Clone the repository and navigate to the root directory:

   ```bash
   git clone <repository_url>
   cd war-takjil
   ```

2. Install dependencies using Bun:

   ```bash
   bun install
   ```

3. Set up environment variables:
   Copy `.env.example` to `.env` and fill in the required external service keys.

4. Run the development server:

   ```bash
   bun run dev
   ```

## 🏗️ Tech Stack

- **Runtime**: Bun
- **Framework**: Nuxt 4 (SSR Disabled / SPA) + Vue 3
- **Language**: TypeScript
- **Styling**: TailwindCSS & Shadcn-vue
- **Database**: Firebase Firestore (FREE tier)
- **Authentication**: Clerk (Google OAuth only)
- **Image Hosting**: Cloudinary (Direct Upload)
- **Maps**: Leaflet.js + OpenStreetMap

## 📏 Coding Conventions & Guidelines

When contributing code, please strictly adhere to the following project-specific rules:

### 1. Data Structure & API Restrictions

- **Aggressive Caching**: Always implement caching first using IndexedDB. We use a 5-minute TTL cache structure to ensure we stick strictly to <10 Firestore reads per user.
- **Query Limits**: Limit Firestore queries at all times (`limit: 30`) and execute queries completely via Geohashes.
- **No Edge Functions**: Everything is entirely client-side. We do not use Nitro backend, API routes, or Edge functions.

### 2. Images & Media

- **NO Firebase Storage**: We do not use Firebase Storage under any circumstances.
- **Cloudinary Only**: All images must be securely uploaded directly to Cloudinary.
- **Client-Side Compression**: Images must be heavily compressed client-side before upload (maximum resolution 1920px, 80% quality) due to quota constrictions. Limit images to a maximum of 3 per spot.

### 3. UI/UX & Viewport

- **Mobile-First & Mobile-Only**: The app is hard-locked to mobile sizing (approx 430px max width). **Do not build for desktop viewing or implement desktop responsiveness.**
- **Component Primitives**: Implement and reuse existing *shadcn-vue* layout variables located in `@/components/ui/`.

### 4. Robustness

- **Mandatory Error Handling**: Code must account for edge-case errors like quota exceeded exceptions, offline networks, blocked cookies, and denied location permissions.

## 📂 Project Structure Overview

```text
war-takjil/
├── app/
│   ├── components/      # Divided correctly: map/, report/, spot/, ui/
│   ├── composables/     # Store states (useFirestore, useCloudinary)
│   ├── pages/           # Pages (index.vue, spot/[id].vue)
│   ├── types/           # Essential TS Definition Contracts
│   └── utils/           # Utilities (compression, geohashes)
├── plugins/             # Client-side singletons (Clerk, Firebase)
└── public/              # Root assets
```

## ⚖️ Pull Request Protocol

1. Checkout to a descriptive branch name (e.g. `feat/add-image-upload`, `fix/marker-drift`).
2. Write clean commits referencing the exact components modified.
3. Test layout accurately using a simulated mobile resolution.
4. Ensure no cache overrides broke the core application data-store logic.
