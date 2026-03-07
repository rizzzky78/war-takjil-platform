# War Takjil 🌙

![War Takjil Logo](/public/3_7_2026_12_35_24_contentcore.xyz.png)
*A crowdsourced takjil tracker helping you find the best spots during the holy month of Ramadan.*

**War Takjil** is a mobile-first web app designed for real-time takjil (Indonesian breaking-fast food) tracking. It is an open, crowdsourced map platform where users can discover and report takjil sellers' locations, statuses, and availability in real-time, right before iftar.

## The Problem We're Solving

Every Ramadan, people face the same frustrations:

- Driving around looking for takjil spots, wasting precious time before iftar.
- Arriving at their favorite seller only to find them completely sold out.
- Not knowing what's available nearby or missing good spots hidden in small streets.

**War Takjil** solves this by providing a live, crowdsourced Google Maps-style application specifically tailored for takjil hunting.

---

## Features ✨

- **Real-time Map:** Live heatmap and markers of takjil sellers around your area. Green for "Available", Yellow for "Low Stock", and Red for "Sold Out".
- **Instant Reporting:** Drop a pin, take a quick photo, and set the status in 3 simple taps.
- **Spot Search:** Easily search for specific takjil spots by name with visual search results.
- **User Dashboard & Spot Management:** Log in with Google to view, edit, delete, or share the spots you've added via a convenient sidebar.
- **WhatsApp Integration:** Contact sellers directly via "Hubungi Penjual" for booking or availability checks.
- **Status Updates:** Live tracking of seller inventory statuses with auto-expiring reports to ensure freshness.
- **Share Locations:** Easily share your favorite takjil spots with friends and family via social media or shareable links.
- **Client-Side Caching:** Optimized with aggressive IndexedDB caching for blazing-fast, offline-ready performance.
- **Smooth Animations:** GSAP-powered page transitions and map status overlays for a premium feel.
- **Mobile-First Focus:** Designed exclusively for mobile viewports, perfect for quick on-the-go checking before iftar.

![Map View](/public/Screenshot_2026-03-07-12-20-49-550_com.android.chrome.jpg)
*The main map interface displaying green, yellow, and red pins representing takjil spots, optimized for a seamless mobile experience.*

---

## Tech Stack 🛠

This project is built for speed, real-time updates without backend complexities, and free-tier efficiency:

- **Runtime & Package Manager:** Bun
- **Frontend Framework:** Nuxt 4 (Vue 3, SSR Disabled / SPA)
- **Styling & UI Components:** TailwindCSS v4, Shadcn-vue, Radix Vue
- **Database:** Firebase Firestore (Free Tier, utilizing Geo-queries)
- **Authentication:** Clerk (Google OAuth integration for reporters and sellers)
- **Image Processing:** Cloudinary (Direct Upload) with client-side compression via CompressorJS
- **Maps Setup:** Leaflet.js with OpenStreetMap (via Vue-Leaflet)
- **Animations:** GSAP (Page transitions & Map overlays)
- **Storage/Caching:** IndexedDB integration for an aggressive local cache-first strategy.

---

## Architecture & Data Flow 🏗

The application runs entirely on the client side (SPA mode) with zero Edge or Server Functions.

```mermaid
graph TD
    A[Mobile Browser / Nuxt 4 SPA] --> B(IndexedDB)
    B -- "Cache Hit (<5m TTL)" --> A
    B -- "Cache Miss" --> C((Firestore Database))
    A -->|Upload Image| D[Client-Side Compression]
    D -->|Optimized.webp| E((Cloudinary))
    A -->|Auth| F((Clerk OAuth))
    A -->|Tiles| G((OpenStreetMap))
```

*Architecture flow: Requests dynamically intercept the local IndexedDB layer for a 5-minute TTL cache before ever communicating with Firestore, keeping the application extremely lightweight and affordable.*

1. **Map Tracking:** Map viewport changes natively trigger Geohash-based bounding box calculations on the client.
2. **Caching First:** Requests intercept the local IndexedDB layer for a 5-minute TTL cache before hitting Firestore, ensuring we stay within Firebase Free Tier limits (<10 reads per user).
3. **Data Integrity:** Reports expire automatically in 2 hours via Firestore TTL policies and client filtering, ensuring data is always fresh and accurate. A secure cleanup API route handles daily purges for a clean database.
4. **Optimized Images:** Spot photos are compressed directly on the client (max 1920px, 80% quality) and sent securely to Cloudinary (preventing duplicates via filename/username hashing), ensuring no heavy data transfer. NO Firebase Storage is used.

---

## Get Started 🚀

### 1. Prerequisites

- Setup [Bun](https://bun.sh/)
- Get API Keys for **Firebase**, **Clerk**, and **Cloudinary**

### 2. Environment Variables

Create a `.env` file in the root of the project with your API keys. Refer to `nuxt.config.ts` for the variables required:

```bash
# Firebase
NUXT_PUBLIC_FIREBASE_API_KEY=your_key
NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NUXT_PUBLIC_FIREBASE_PROJECT_ID=your_id
NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender
NUXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Clerk
NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key

# Cloudinary
NUXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NUXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_preset
```

### 3. Installation

Install all the required dependencies using Bun:

```bash
bun install
```

### 4. Development Server

Start the application on `http://localhost:3000`:

```bash
bun run dev
```

![Spot Details](/public/Screenshot_2026-03-07-12-20-15-927_com.android.chrome.jpg)
*Users can easily report stock availability, take photos of the stalls, and view details about the takjil menus right from their browser.*

### 5. Production Build

Build for production:

```bash
bun run build
```

Preview locally:

```bash
bun run preview
```

---

## Contributing & Constraints 🤝

Contributions are welcome. Before making any changes, please check `CONTRIBUTION_GUIDE.md` for specific technical decisions.

![Promotional Material](/public/og_image.png)
*Don't miss out on your favorite takjils before iftar! Help the community by pinning your discoveries.*
