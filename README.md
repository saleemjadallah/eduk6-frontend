# HeadShotHub Frontend

Modern, responsive web application for AI-powered professional headshot generation. Built with React 19, TypeScript, and Tailwind CSS v4.

## 🚀 Features

- **Multi-Auth System**: Email/password, Google OAuth, and OTP passwordless login
- **Email Verification**: OTP code input with auto-submit and paste support
- **Photo Upload**: Drag-and-drop interface with progress tracking
- **Style Templates**: 8 professional templates with preview
- **Pricing Plans**: 3 tiers (Basic, Professional, Executive)
- **Payment Integration**: Stripe checkout with Elements
- **Real-time Dashboard**: Batch tracking and status updates
- **Download Manager**: Individual and bulk headshot downloads
- **Responsive Design**: Mobile-first, works on all devices

## 📋 Tech Stack

- **Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Authentication**: Firebase (Google OAuth)
- **Payments**: Stripe Elements
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **File Upload**: React Dropzone

## 🏗️ Project Structure

```
src/
├── components/
│   ├── GoogleSignInButton.tsx    # Google OAuth button
│   └── [other components]
├── pages/
│   ├── HomePage.tsx               # Landing page
│   ├── RegisterPage.tsx           # Registration with email/password
│   ├── LoginPage.tsx              # Login page
│   ├── VerifyEmailPage.tsx        # OTP verification
│   ├── UploadPage.tsx             # Photo upload
│   ├── PricingPage.tsx            # Plan selection
│   ├── CheckoutPage.tsx           # Stripe checkout
│   ├── ProcessingPage.tsx         # Generation status
│   ├── DashboardPage.tsx          # User batches
│   ├── HeadshotsPage.tsx          # View results
│   └── SettingsPage.tsx           # User settings
├── lib/
│   ├── api.ts                     # API client (Axios)
│   ├── firebase.ts                # Firebase configuration
│   ├── plans.ts                   # Pricing plans
│   └── templates.ts               # Style templates
├── types/
│   └── index.ts                   # TypeScript types
├── App.tsx                        # App routing
└── main.tsx                       # Entry point
```

## 🛠️ Setup

### Prerequisites

- Node.js 18+
- Backend API running (see backend repository)

### Quick Start

1. **Clone and install:**
```bash
git clone https://github.com/saleemjadallah/mydscvr.frontend.git
cd mydscvr.frontend
npm install
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your credentials
```

3. **Start development server:**
```bash
npm run dev
```

App runs on `http://localhost:5173`

## 🔐 Environment Variables

Create `.env` file in the root:

```bash
# Backend API URL
VITE_API_URL=http://localhost:3000

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here

# Firebase (Google OAuth)
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=headshothub.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=headshothub
VITE_FIREBASE_STORAGE_BUCKET=headshothub.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abc...
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Optional
VITE_OTP_CODE_EXPIRY_MINUTES=10
VITE_MAX_UPLOAD_SIZE_MB=50
```

See `.env.example` for complete documentation.

## 📝 Available Scripts

```bash
npm run dev          # Start development server (http://localhost:5173)
npm run build        # Build for production (runs tsc then vite build)
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🎨 Pages Overview

### Public Pages

**HomePage** (`/`)
- Hero section with features
- How it works
- Sample gallery
- CTA buttons

**RegisterPage** (`/register`)
- Email/password registration form
- Google Sign-In button
- Sends OTP for email verification

**LoginPage** (`/login`)
- Email/password login
- Google Sign-In option
- OTP passwordless login

**VerifyEmailPage** (`/verify-email`)
- 6-digit OTP input
- Auto-submit on complete
- Paste support
- Resend functionality

### Protected Pages (Require Auth)

**UploadPage** (`/upload`)
- Drag-and-drop photo upload
- Validation (12-20 photos, file size)
- Preview thumbnails
- Batch management

**PricingPage** (`/pricing`)
- 3 pricing tiers with features
- Style template selection
- Stripe checkout integration

**CheckoutPage** (`/checkout`)
- Stripe Elements integration
- Payment form
- Loading states
- Error handling

**ProcessingPage** (`/processing`)
- Batch status tracking
- Real-time updates
- Estimated completion time
- Progress visualization

**DashboardPage** (`/dashboard`)
- List all user batches
- Status indicators
- Quick actions (view, download)
- Batch history

**HeadshotsPage** (`/headshots/:id`)
- Gallery view of generated headshots
- Filter by template
- Individual download
- Bulk download (ZIP)
- Edit requests (background, outfit)

**SettingsPage** (`/settings`)
- User profile
- Email preferences
- Account management
- Logout

## 🎯 Authentication Flow

### Email/Password Registration
1. User fills registration form → `/register`
2. Backend creates account and sends OTP
3. User redirected to `/verify-email?email={email}`
4. User enters 6-digit code
5. Backend verifies and logs in
6. Redirected to `/dashboard`

### Google OAuth
1. User clicks "Continue with Google"
2. Firebase popup authentication
3. Frontend gets ID token
4. Sent to backend `/api/auth/google`
5. Backend verifies and creates session
6. User logged in, redirected to `/dashboard`

### OTP Passwordless Login
1. User enters email on login page
2. Backend sends OTP code
3. User enters code
4. Logged in if valid

## 💰 Pricing Tiers

Defined in `src/lib/plans.ts`:

- **Basic** ($29): 40 headshots, 2 templates
- **Professional** ($39): 100 headshots, 4 templates
- **Executive** ($59): 200 headshots, all 8 templates

## 🎨 Style Templates

Defined in `src/lib/templates.ts`:

1. **LinkedIn** (1:1) - Business formal
2. **Corporate** (4:5) - Team pages
3. **Creative** (3:4) - Portfolio
4. **Resume** (2:3) - CV applications
5. **Social** (1:1) - Social media
6. **Executive** (2:3) - Leadership
7. **Casual** (4:5) - Approachable
8. **Speaker** (16:9) - Conference

Each template includes:
- Dimensions and aspect ratio
- Platform optimization
- Preview image

## 🔌 API Integration

API client in `src/lib/api.ts` using Axios:

**Authentication:**
- `authApi.register()` - Register user
- `authApi.verifyRegistration()` - Verify OTP
- `authApi.login()` - Login
- `authApi.googleAuth()` - Google OAuth
- `authApi.requestOtp()` - Request OTP code
- `authApi.loginWithOtp()` - Login with OTP
- `authApi.logout()` - Logout
- `authApi.me()` - Get current user

**Batches:**
- `batchApi.uploadPhotos()` - Upload photos
- `batchApi.createBatch()` - Create batch
- `batchApi.getBatches()` - List batches
- `batchApi.getBatch()` - Get batch details
- `batchApi.requestEdit()` - Request edit
- `batchApi.downloadHeadshot()` - Download single
- `batchApi.downloadAll()` - Download ZIP

**Checkout:**
- `checkoutApi.createSession()` - Create Stripe session
- `checkoutApi.verifySession()` - Verify payment

All requests include credentials (cookies for session).

## 🎨 Styling

### Tailwind CSS v4

Using Tailwind CSS v4 with PostCSS plugin:

```typescript
// tailwind.config.ts
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',    // Blue
        secondary: '#8b5cf6',  // Purple
      }
    }
  }
}
```

### Radix UI Components

Pre-styled accessible components:
- Dialog
- Dropdown Menu
- Progress
- Select
- Switch
- Tabs
- Toast

## 🧪 Testing

### Manual Testing Checklist

**Authentication:**
- [ ] Email/password registration
- [ ] Email verification with OTP
- [ ] Email/password login
- [ ] Google Sign-In
- [ ] OTP passwordless login
- [ ] Session persistence
- [ ] Logout

**Upload Flow:**
- [ ] Photo upload (drag-and-drop)
- [ ] Photo validation
- [ ] Preview thumbnails
- [ ] Batch creation

**Payment:**
- [ ] Plan selection
- [ ] Stripe checkout
- [ ] Payment success
- [ ] Webhook handling

**Dashboard:**
- [ ] View batches
- [ ] Track status
- [ ] Download headshots

### Test Cards

Use Stripe test mode:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

## 🚢 Deployment

### Cloudflare Pages (Recommended)

1. **Connect repository:**
   - Go to Cloudflare Pages dashboard
   - Click "Create a project"
   - Connect GitHub repository

2. **Build settings:**
   ```
   Build command: npm run build
   Build output directory: dist
   Root directory: /
   ```

3. **Environment variables:**
   Add all `VITE_*` variables from `.env.example`

4. **Deploy:**
   - Push to main branch
   - Auto-deploys on every push

### Alternative: Vercel, Netlify

Similar process:
- Build command: `npm run build`
- Output: `dist/`
- Set environment variables

## 🔒 Security Features

- **Environment Variables**: All sensitive data in `.env`
- **HTTPS Only**: Force HTTPS in production
- **CORS**: Backend validates origin
- **Session Cookies**: HTTP-only, secure
- **XSS Protection**: React auto-escapes
- **CSRF Protection**: SameSite cookies
- **Input Validation**: Client and server-side

## 📱 Responsive Design

Mobile-first approach:
- Breakpoints: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px)
- Touch-friendly buttons (min 44px)
- Optimized images
- Progressive enhancement

## 🐛 Common Issues

### CORS Errors
Ensure backend `ALLOWED_ORIGINS` includes frontend URL

### Firebase Not Working
Check all Firebase config variables are set correctly

### Images Not Loading
Verify `VITE_API_URL` points to correct backend

### Build Fails
Run `npm install` and check Node.js version (18+)

## 🔗 Related Repositories

- **Backend API**: https://github.com/saleemjadallah/mydscvr

## 📚 Documentation

For setup and configuration:
- Backend README: See backend repository
- Backend SETUP_GUIDE.md: Complete setup instructions
- `.env.example`: All environment variables

## 📄 License

MIT License - See LICENSE file for details

## 👤 Author

Saleem Jadallah

---

**Note**: This frontend requires the HeadShotHub backend API to be running.
