# GreenArch Setup Guide

Complete guide to set up and run the GreenArch project locally.

## Prerequisites

- **Node.js** 18.17.0 or later
- **npm**, **yarn**, or **pnpm** (pnpm recommended)
- A **Firebase project** created on [Firebase Console](https://console.firebase.google.com)
- **Git** for version control

## Step 1: Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd greenarch

# Install dependencies
npm install
# or
pnpm install
# or
yarn install
```

## Step 2: Firebase Setup

### 2.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a new project"
3. Enter project name: `greenarch` or similar
4. Follow the setup wizard
5. Create a Firestore database in India region (us-central1 or us-east1)
6. Enable Authentication methods:
   - Email/Password
   - Google
   - Phone (optional)

### 2.2 Get Firebase Credentials

1. Go to Project Settings (gear icon)
2. Click "Service Accounts" tab
3. Click "Generate New Private Key" (save as `serviceAccountKey.json`)
4. Copy the Web SDK configuration
5. Go back to Project Settings > General tab
6. Look for your project credentials

### 2.3 Set Up Environment Variables

Create `.env.local` file in the root:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=<your-api-key>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<your-project>.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=greenarch-a4677
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<your-project>.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<your-sender-id>
NEXT_PUBLIC_FIREBASE_APP_ID=<your-app-id>
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=<your-measurement-id>

# For Firebase Admin SDK (server-side only)
# Convert the serviceAccountKey.json to a string
FIREBASE_ADMIN_SDK_KEY=<serviceAccountKey-as-JSON-string>

# Third-party Services (get from their respective platforms)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxx

NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSy...

FCM_SERVER_KEY=AAAAxxxx...

# Twilio (for SMS)
TWILIO_ACCOUNT_SID=ACxxxx...
TWILIO_AUTH_TOKEN=xxxxxxx
TWILIO_PHONE_NUMBER=+1234567890

# Resend (for Email)
RESEND_API_KEY=re_xxxxxxx

# NextAuth (if using NextAuth for auth)
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=http://localhost:3000
```

### 2.4 Deploy Firestore Rules and Indexes

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Set the Firebase project
firebase use greenarch-a4677

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Firestore indexes
firebase deploy --only firestore:indexes
```

## Step 3: Install Additional Dependencies

The project uses these key packages. They should be installed automatically, but verify:

```bash
# Core
npm install next@latest react@latest react-dom@latest

# State Management
npm install zustand

# Utilities
npm install firebase firebase-admin

# Optional but recommended
npm install zod                    # Data validation
npm install clsx classnames        # CSS class utilities
npm install date-fns              # Date utilities
```

## Step 4: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 5: Verify Setup

1. **Homepage loads** - Visit http://localhost:3000
2. **Navigation works** - Click on "Browse Nurseries" and "Find Gardeners"
3. **Auth routes work** - Visit http://localhost:3000/auth/login
4. **Check Console** - No errors in browser console or terminal

## Project Structure Quick Reference

```
greenarch/
├── app/                    # Next.js routes
│   ├── (user)/            # Public routes
│   ├── (partner)/         # Partner routes
│   ├── (admin)/           # Admin routes
│   ├── (auth)/            # Auth routes
│   └── api/               # API endpoints
├── components/            # React components
│   ├── ui/               # UI primitives
│   ├── layout/           # Layout components
│   ├── nursery/          # Nursery components
│   └── ...
├── lib/                   # Business logic
│   ├── db/               # Firestore queries
│   ├── hooks/            # Custom hooks
│   ├── store/            # Zustand stores
│   ├── utils/            # Utilities
│   └── validators/       # Zod schemas
├── types/                 # TypeScript types
├── functions/            # Firebase Cloud Functions
├── __tests__/            # Tests
├── public/               # Static files
└── .env.local            # Environment variables (local only)
```

## Common Development Tasks

### Add a New Route

1. Create folder in `/app` or use route groups
2. Add `page.tsx` for the route
3. Add `layout.tsx` for shared layout (optional)

Example:
```
app/(user)/products/[productId]/page.tsx
```

### Create a New Component

1. Create folder in `/components` with category
2. Add `ComponentName.tsx`
3. Export from index file if grouping multiple

Example:
```
components/product/ProductCard.tsx
```

### Add Database Query

1. Create function in `/lib/db/[collection].ts`
2. Use Firestore query builders
3. Export the function

Example:
```typescript
export async function getProductsByNursery(nurseryId: string) {
  const q = query(collection(db, 'products'), where('nurseryId', '==', nurseryId));
  return getDocs(q);
}
```

### Use Global State

Import from Zustand store:
```typescript
import { useCartStore } from '@/lib/store/cartStore';

// In component
const { items, addItem } = useCartStore();
```

## Troubleshooting

### Firebase Connection Issues

```bash
# Verify credentials
firebase auth:export

# Check project setup
firebase project:info
```

### Port Already in Use

```bash
# Use different port
npm run dev -- -p 3001
```

### Dependencies Missing

```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

### TypeScript Errors

```bash
# Regenerate types
npm run build
```

## Production Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project to Vercel
3. Add environment variables
4. Deploy

### Self-hosted

```bash
# Build
npm run build

# Run
npm start
```

## Monitoring & Debugging

### Check Firestore

1. Go to Firebase Console > Firestore Database
2. View collections and documents
3. Check security rules

### View Cloud Functions Logs

```bash
firebase functions:log
```

### Browser DevTools

- Check Network tab for API calls
- Use React DevTools extension
- Check console for errors

## Next Steps

1. **Customize Theme** - Edit `tailwind.config.ts`
2. **Set Up Authentication** - Implement login/signup flows
3. **Add Payment** - Integrate Razorpay
4. **Deploy Cloud Functions** - Set up backend logic
5. **Write Tests** - Add unit and e2e tests

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zustand](https://github.com/pmndrs/zustand)
- [Firestore Best Practices](https://firebase.google.com/docs/firestore/best-practices)

## Getting Help

- Check the [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for detailed info
- Look at example components in `/components`
- Review the `.env.example` file
- Check console logs for errors

---

**Happy Coding! 🌱**
