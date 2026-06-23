# EnVest - Mobile Investment App

A modern, mobile-first investment application built with React, TypeScript, and Tailwind CSS.

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run the app
npm run dev

# 3. Open http://localhost:5173 in your browser
```

**That's it!** No server setup needed. 🎉

## 📱 Features

✅ **Complete Authentication**
- Email/Password signup & login
- Face ID authentication
- Email verification with OTP
- Multi-step KYC verification
- Password reset flow

✅ **Dashboard**
- Portfolio overview with balances
- Investment tracking
- Transaction history
- Quick action buttons

✅ **Wallet Management**
- Fund NGN wallet (Nigerian Naira)
- Deposit USD wallet (US Dollar)
- Multiple payment methods
- Quick amount presets

✅ **Stock Investment**
- Browse 5 Nigerian stocks
- Real-time price updates
- Calculate shares based on amount
- One-click investment

✅ **Payment Processing**
- Secure payment gateway
- Card payment simulation
- OTP verification
- Success confirmation

## 🎨 Design

- **Mobile-First**: Optimized for mobile devices (320px - 480px)
- **Dark Theme**: Easy on the eyes with slate-900 background
- **Yellow Accents**: Bright, accessible primary color
- **Touch-Friendly**: Large buttons and inputs for mobile
- **No Animations**: Fast, responsive feel

## 🛠️ Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **React Router** - Navigation
- **Vite** - Build tool
- **shadcn/ui** - Pre-built components

## 📁 Project Structure

```
client/
├── pages/          # 14 page components
├── stores/         # Zustand stores (auth, investment, onboarding)
├── components/     # Reusable UI components
├── App.tsx         # Routing setup
└── global.css      # Theme & global styles
```

## 📱 All Pages

1. **Splash** (`/`) - Welcome screen
2. **Onboarding** (`/onboarding`) - Feature carousel
3. **Create Account** (`/create-account`) - Registration
4. **Verify Email** (`/verify-email`) - OTP verification
5. **KYC** (`/kyc`) - Identity verification
6. **Login** (`/login`) - User login
7. **Forgot Password** (`/forgot-password`) - Password recovery
8. **Reset Password** (`/reset-password`) - Password reset
9. **Face ID** (`/face-id`) - Biometric login
10. **Home** (`/home`) - Main dashboard
11. **Fund NGN** (`/fund-ngn-wallet`) - Top up NGN
12. **Deposit USD** (`/deposit-usd-wallet`) - Deposit USD
13. **Payment** (`/payment-gateway`) - Payment processing
14. **Invest** (`/invest-stocks`) - Stock browsing

## 📊 State Management

### Auth Store
```typescript
- User data (email, name, phone)
- Login status
- Logout function
```

### Investment Store
```typescript
- Portfolio value
- Wallet balances (NGN & USD)
- Investments list
```

### Onboarding Store
```typescript
- Multi-step form data
- Current step
- Form validation
```

## 🎯 Usage Examples

### Sign Up
1. Click "Create Account"
2. Fill in email, name, phone, password
3. Verify email with 6-digit code
4. Complete KYC (country, ID, bank)
5. Success! Access home page

### Invest
1. From Home, scroll to "My Investments"
2. Click "View all"
3. Select a stock
4. Enter investment amount
5. Complete payment
6. Investment added to portfolio

### Fund Wallet
1. From Home, click "Fund NGN"
2. Select amount (or use quick buttons)
3. Choose payment method
4. Enter card details
5. Verify OTP
6. Success! Balance updated

## 🔧 Commands

```bash
npm run dev           # Start dev server
npm run build         # Build for production
npm run preview       # Preview production build
npm run type-check    # Check TypeScript
npm run format        # Format code
npm run test          # Run tests
```

## 🎨 Customization

### Change Colors
Edit `client/global.css`:
```css
:root {
  /* Change from yellow-400 to your color */
  --primary: your-color;
}
```

### Add New Page
1. Create `client/pages/MyPage.tsx`
2. Add route in `client/App.tsx`:
```typescript
<Route path="/my-page" element={<MyPage />} />
```

### Change Port
Edit `vite.config.ts`:
```typescript
server: {
  port: 3000, // Change to your port
}
```

## 📱 Mobile Testing

### Browser DevTools
1. Open DevTools (F12)
2. Click device icon (Ctrl+Shift+M)
3. Select iPhone/Android preset
4. Refresh page

### Real Device
1. Find your computer's IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Access: `http://YOUR_IP:5173`
3. Test on your phone

## 🚀 Deployment

### Netlify
1. Push to Git
2. Connect to Netlify
3. Build command: `npm run build`
4. Publish directory: `dist`

### Vercel
1. Push to Git
2. Import project in Vercel
3. Deploy (auto-configured)

## 🐛 Troubleshooting

### Port Already in Use
```bash
npm run dev -- --port 3000
```

### Dependencies Issues
```bash
rm -rf node_modules package-lock.json
npm install
```

### Build Errors
```bash
npm run type-check  # Check TypeScript
npm run build       # Try building
```

## 📚 Resources

- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Zustand](https://github.com/pmndrs/zustand)
- [React Router](https://reactrouter.com)
- [Vite Docs](https://vitejs.dev)

## 💡 Tips

- All pages are mobile-optimized
- Dark theme reduces eye strain
- Large touch targets (48px+)
- No responsive breakpoints needed
- Works offline (except API calls)

## 📝 Notes

- Mock data included (no API needed)
- All state managed with Zustand
- Forms validated before submission
- OTP simulation accepts any 6 digits
- Payment gateway is a mock

## 🎉 Next Steps

1. Test all user flows
2. Customize colors to match your brand
3. Add real API endpoints
4. Connect to payment provider
5. Deploy to production

---

**Built with ❤️ for mobile-first investing**

Start developing: `npm install && npm run dev`
# ADMIN-WEB
