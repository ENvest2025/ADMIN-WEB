# EnVest Mobile App - Quick Start

## 🚀 Get Started in 3 Steps

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Run the App
```bash
npm run dev
```

The app will open automatically at `http://localhost:5173`

### Step 3: Test on Mobile
1. Open browser DevTools (F12 or Right Click → Inspect)
2. Click the device icon to toggle mobile view
3. Set device type to "iPhone 12/13/14" or any mobile
4. Refresh the page

## 📱 What You Get

- **14 Mobile Pages** - Fully responsive
- **State Management** - Zustand for auth and investments
- **Dark Theme** - Mobile-optimized colors
- **All Features** - Auth, Wallets, Investments, Payments

## 🎯 Test the App

### Sign Up Flow:
1. Splash → Onboarding → Create Account
2. Fill in: email, name, phone, password
3. Verify email (enter any 6 digits)
4. Complete KYC
5. Access Home page

### Login Flow:
1. Click "Login" on Onboarding
2. Enter any email/password
3. Or try "Face ID"

### Fund Wallet:
1. Home → Fund NGN Wallet
2. Select amount
3. Choose payment method

### Invest:
1. Home → (scroll to My Investments) → View all
2. Select a stock
3. Enter amount
4. Complete payment

## 📝 Files Modified

- `package.json` - Removed server dependencies
- `vite.config.ts` - Client-only configuration
- `App.tsx` - Removed server imports
- `global.css` - Mobile viewport setup
- `index.html` - Mobile meta tags

## ⚙️ Available Commands

```bash
npm run dev           # Start development server
npm run build         # Build for production
npm run preview       # Preview production build
npm run type-check    # Run TypeScript check
npm run format        # Format code
npm run test          # Run tests
```

## 🎨 Customize

### Change Colors
Edit colors in `client/global.css` (currently using slate-900 + yellow-400)

### Add New Pages
1. Create `client/pages/MyPage.tsx`
2. Add to `client/App.tsx` routes

### Change Port
Edit `vite.config.ts` server.port (default: 5173)

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Use different port
npm run dev -- --port 3000
```

### Dependencies Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Hot Reload Not Working
- Restart the dev server: `npm run dev`

## 📚 Learn More

- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Zustand](https://github.com/pmndrs/zustand)
- [React Router](https://reactrouter.com)

## ✨ Key Features

✅ Fully responsive mobile design
✅ Dark theme (slate-900 background)
✅ Yellow accent color (#FBBF24)
✅ Touch-friendly buttons (48px+ height)
✅ Mobile viewport optimization
✅ No server-side code
✅ Zero configuration required
✅ Works on Android & iOS

---

**Ready? Run `npm install && npm run dev`** 🎉
