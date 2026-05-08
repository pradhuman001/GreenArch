# GreenArch - Sustainable Gardening Platform

A full-stack Next.js application connecting users with nurseries and professional gardeners for sustainable green space solutions.

## Project Structure

### Root Configuration Files
- **`tailwind.config.ts`** - Tailwind CSS configuration
- **`tsconfig.json`** - TypeScript configuration
- **`eslint.config.mjs`** - ESLint configuration
- **`postcss.config.mjs`** - PostCSS configuration
- **`.env.example`** - Environment variables template
- **`firestore.rules`** - Firestore security rules
- **`firestore.indexes.json`** - Firestore index definitions
- **`firebase.json`** - Firebase project configuration
- **`.firebaserc`** - Firebase project alias

### Application Structure

#### `/app` - Next.js App Router
```
(user)         # User-facing routes (public access)
  ├── nurseries/
  ├── gardeners/
  ├── cart/
  ├── checkout/
  ├── orders/
  ├── bookings/
  └── profile/

(partner)      # Partner panel (nursery owners)
  └── partner/
      ├── products/
      ├── orders/
      ├── earnings/
      └── settings/

(admin)        # Admin panel
  └── admin/
      ├── users/
      ├── nurseries/
      ├── gardeners/
      ├── orders/
      └── payouts/

(auth)         # Authentication routes
  ├── login/
  ├── register/
  └── forgot-password/

api/           # Next.js API routes
  ├── maps/
  ├── payments/
  ├── notifications/
  └── admin/

loading.tsx    # Global loading state
error.tsx      # Global error boundary
not-found.tsx  # 404 page
```

#### `/components` - React Components
```
ui/            # Reusable UI primitives (shadcn/ui)
layout/        # Shared layout components
nursery/       # Nursery-related components
product/       # Product-related components
cart/          # Shopping cart components
checkout/      # Checkout flow components
gardener/      # Gardener profile components
order/         # Order display components
partner/       # Partner panel components
admin/         # Admin panel components
shared/        # Global shared components
```

#### `/lib` - Business Logic
```
firebase.ts           # Firebase client config
firebase-admin.ts    # Firebase admin SDK
middleware.ts        # Auth middleware

db/                  # Firestore query functions
  ├── users.ts
  ├── nurseries.ts
  ├── products.ts
  ├── orders.ts
  ├── gardeners.ts
  ├── bookings.ts
  ├── reviews.ts
  ├── carts.ts
  ├── notifications.ts
  └── payouts.ts

hooks/               # Custom React hooks
  ├── useAuth.ts
  ├── useLocation.ts
  ├── useCart.ts
  ├── useNearbyNurseries.ts
  ├── useNearbyGardeners.ts
  └── useNotifications.ts

store/               # Zustand global state
  ├── authStore.ts
  ├── cartStore.ts
  ├── locationStore.ts
  └── uiStore.ts

utils/               # Pure utility functions
  ├── formatPrice.ts
  ├── formatDate.ts
  ├── calculateCommission.ts
  ├── calculateDistance.ts
  ├── generateSlug.ts
  └── validatePhone.ts

validators/          # Zod schemas (data validation)
```

#### `/types` - TypeScript Types
```
index.ts          # All application interfaces
next-auth.d.ts    # NextAuth session extensions
```

#### `/functions` - Firebase Cloud Functions
```
src/
  ├── index.ts
  ├── triggers/       # Firestore event triggers
  ├── scheduled/      # Cron jobs
  └── http/          # Callable HTTP functions
```

#### `/__tests__` - Test Suite
```
unit/          # Unit tests
  ├── formatPrice.test.ts
  ├── calculateCommission.test.ts
  └── calculateDistance.test.ts

e2e/           # End-to-end tests
  ├── purchase-flow.spec.ts
  └── booking-flow.spec.ts
```

#### `/public` - Static Assets
```
logo.svg
logo-dark.svg
placeholder-plant.jpg
icons/
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm/pnpm/yarn
- Firebase account and project
- Environment variables configured

### Installation

1. **Clone the repository**
```bash
git clone <repo-url>
cd greenarch
```

2. **Install dependencies**
```bash
npm install
# or
pnpm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
# Edit .env.local with your Firebase credentials and API keys
```

4. **Set up Tailwind CSS**
The project uses Tailwind CSS v4. Configuration is in `tailwind.config.ts`.

### Development

Start the development server:
```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Key Features

### For Users
- Browse nurseries and products by location
- Add products to cart and checkout
- Book professional gardeners
- Track orders and bookings
- Leave reviews and ratings

### For Nursery Partners
- Manage product inventory
- Receive and fulfill orders
- View earnings dashboard
- Manage bank/payout information

### For Gardeners
- Create profile and showcase services
- Manage bookings
- Receive notifications

### For Admins
- User and nursery management
- Order and booking oversight
- Payout processing
- System analytics

## Technology Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **Zustand** - Global state management

### Backend
- **Firebase** - Authentication & Firestore database
- **Firebase Cloud Functions** - Serverless backend
- **Firebase Admin SDK** - Server-side operations
- **Razorpay** - Payment processing

### Services
- **Google Maps API** - Location and geocoding
- **Firebase Cloud Messaging** - Push notifications
- **Twilio** - SMS notifications
- **Resend** - Email service

## Environment Variables

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=greenarch-a4677
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
FIREBASE_ADMIN_SDK_KEY=

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=

# Email/SMS
FCM_SERVER_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
RESEND_API_KEY=
```

## Authentication Roles

The application supports 4 user roles:
1. **user** - Regular customers browsing and buying
2. **partner** - Nursery owners managing products
3. **gardener** - Professional gardeners offering services
4. **admin** - System administrators

## Database Schema

### Collections
- **users** - User accounts with roles
- **nurseries** - Nursery information and details
- **products** - Plant/product listings
- **orders** - Customer orders
- **bookings** - Gardener service bookings
- **gardeners** - Gardener profiles
- **reviews** - User reviews and ratings
- **carts** - Shopping carts
- **notifications** - User notifications
- **payouts** - Partner payment records

## Firestore Security Rules

Security rules are defined in `firestore.rules` with role-based access control:
- Public read for nurseries, gardeners, products
- User-scoped read/write for personal data
- Partner-only access to product management
- Admin-only access to sensitive operations

## Firebase Cloud Functions

### Triggers
- **onOrderCreated** - Send confirmation emails/SMS
- **onOrderStatusChanged** - Notify users of updates
- **onBookingCreated** - Notify gardeners
- **onProductStockLow** - Alert partners
- **onReviewCreated** - Update ratings

### Scheduled
- **weeklyPayoutSummary** - Send Monday payouts
- **expireOldNotifications** - Clean up old data

### HTTP
- **setUserRole** - Admin function to assign roles

## Deployment

### Firestore
```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

### Cloud Functions
```bash
cd functions
firebase deploy --only functions
```

### Next.js App
Deploy to Vercel:
```bash
npm run build
```

## Testing

Run unit tests:
```bash
npm test
```

Run e2e tests:
```bash
npm run test:e2e
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Ensure tests pass
4. Submit a pull request

## License

[Add your license here]

## Support

For issues or questions, contact [support email].

---

**Last Updated:** May 2026
**Project Status:** In Development
