# PetMarketplace — Frontend

Customer-facing web application for the PetMarketplace platform. Built with **Next.js 16 App Router** and **TypeScript**, it serves both **Buyers** (browse, favorite, inquire) and **Sellers** (create listings, manage images, track inquiries).

**Live:** https://pets-marketplace.netlify.app

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Forms | Formik 2 + Yup |
| HTTP | Axios |
| Icons | Lucide React |
| Notifications | React Hot Toast |
| Auth | JWT (stored in localStorage) |

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/              # Public routes
│   │   ├── login/
│   │   └── register/
│   ├── (main)/              # Protected routes
│   │   ├── dashboard/       # Buyer & Seller dashboards
│   │   ├── favorites/       # Saved listings
│   │   ├── inquiries/       # Messaging threads
│   │   ├── listings/        # Browse all pets + detail page
│   │   ├── notifications/
│   │   └── profile/
│   ├── layout.tsx
│   └── page.tsx             # Home / landing page
├── components/
│   ├── features/            # Feature-specific components
│   │   └── listings/        # ListingCard, ListingFilters, ListingGrid
│   ├── layout/              # Navbar, Footer, ProtectedRoute
│   └── ui/                  # Button, Input, Select, Modal, Badge, Spinner…
├── context/
│   └── AuthContext.tsx      # Global auth state
├── hooks/
│   └── useListings.ts       # Listings data fetching hook
├── lib/
│   ├── api/                 # Typed API wrappers
│   │   ├── auth.ts
│   │   ├── client.ts        # Axios instance + interceptors
│   │   ├── favorites.ts
│   │   ├── inquiries.ts
│   │   ├── listings.ts
│   │   ├── notifications.ts
│   │   └── reviews.ts
│   └── utils/
│       └── format.ts        # formatPrice, formatDate, formatAge
└── types/
    └── index.ts             # Shared TypeScript types
```

---

## Features

### Buyers
- Browse and filter all active pet listings (species, gender, city, price range, vaccinated)
- View listing detail with images, pet info, seller reviews
- Save / remove favorites
- Send inquiries and chat with sellers
- Receive and manage notifications
- View and edit profile

### Sellers
- Create pet listings (title, species, breed, age, price, city, description)
- Upload primary image on creation; add/remove more images afterwards
- Submit listings for admin approval
- Track listing status (Draft → Pending Review → Active / Rejected)
- View and respond to buyer inquiries per listing

### Auth
- Register as Buyer or Seller (admin verification required before first login)
- JWT stored in `localStorage`; auto-injected on every API request
- Auto-logout on `401 Unauthorized`
- Role-based route protection (`Buyer`, `Seller`)

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Create optimised production build |
| `npm start` | Serve production build |
| `npm run lint` | Run ESLint |

---

## API Integration

All API calls live in `src/lib/api/`. The Axios client (`client.ts`) automatically:
- Attaches `Authorization: Bearer <token>` from localStorage
- Intercepts `401` responses and logs the user out

Standard API response shape:

```ts
{
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}
```

Paginated responses add: `totalCount`, `pageNumber`, `pageSize`, `totalPages`, `hasNextPage`, `hasPreviousPage`.

---

## Deployment

The app is deployed on **Netlify** with automatic builds from the main branch.

Build settings:
- Build command: `npm run build`
- Publish directory: `.next`
