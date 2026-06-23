# EnVest Mobile App - Client Only

This is a **mobile-only React app** with NO server-side code.

## ✨ What's Included

✅ 14 Mobile Pages
✅ Full Authentication Flow
✅ State Management (Zustand)
✅ Dark Theme UI
✅ Mobile Optimization
✅ Touch-Friendly Design

## ❌ What's NOT Included

❌ No Server Code (Express removed)
❌ No API Endpoints (mock data only)
❌ No Database Setup
❌ No Backend Configuration

## 🚀 Installation & Run

### Step 1: Install
```bash
npm install
```

### Step 2: Run
```bash
npm run dev
```

### Step 3: Open
Browser will automatically open at `http://localhost:5173`

**That's all you need!** ✨

## 📱 Test on Mobile

### Method 1: Browser DevTools
1. Press F12 to open DevTools
2. Click device icon (Ctrl+Shift+M on Windows, Cmd+Shift+M on Mac)
3. Select iPhone preset
4. Refresh page

### Method 2: Real Device
1. Open terminal and find your computer IP:
   - Windows: `ipconfig` → look for IPv4 Address
   - Mac/Linux: `ifconfig` → look for inet

2. On your phone, go to:
   ```
   http://YOUR_COMPUTER_IP:5173
   ```

## 🎯 Test the App

1. **Splash Screen** (auto-redirects in 2 seconds)
2. **Click "Create Account"**
3. **Fill in form**:
   - Email: any email
   - First Name: John
   - Last Name: Doe
   - Phone: +234 801 000 0000
   - Password: any password
4. **Verify Email**: Enter any 6 digits
5. **Complete KYC**:
   - Country: Nigeria
   - ID Type: National ID
   - ID Number: 12345678
   - Bank: First Bank
   - Account: 0123456789
6. **Success!** You're on the Home page

## 🔐 Other Flows to Try

### Login
1. Go back to `/login` (or restart app and click "Login")
2. Enter any email/password
3. Or try "Use Face ID"

### Fund Wallet
1. From Home → "Fund NGN"
2. Select amount
3. Choose payment method
4. Complete payment

### Invest
1. From Home → Scroll to "My Investments"
2. Click "View all"
3. Select a stock
4. Enter amount
5. Complete payment

## 📁 Project Files

```
client/              ← All client code (what you edit)
├── pages/           ← 14 pages
├── stores/          ← State management
├── components/      ← UI components
└── App.tsx          ← Routing

public/              ← Static files
index.html           ← Main HTML
vite.config.ts       ← Vite config
package.json         ← Dependencies
```

## ⚙️ Available Commands

```bash
npm run dev          # Development (auto-refresh)
npm run build        # Production build
npm run preview      # Preview production
npm run type-check   # Check TypeScript
npm run format       # Format code
npm run test         # Run tests
```

## 🎨 Customize

### Change Primary Color
Edit in `client/global.css`:
```css
:root {
  --primary: 222.2 47.4% 11.2%;  /* Change this */
}
```

### Add a New Page
1. Create `client/pages/NewPage.tsx`
2. Add to `client/App.tsx`:
```typescript
<Route path="/new-page" element={<NewPage />} />
```

## 🔧 Troubleshooting

### Port Already in Use
```bash
npm run dev -- --port 3000
```

### Module Not Found
```bash
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors
```bash
npm run type-check
```

## 📝 Important Notes

- ✅ This is a **frontend-only** application
- ✅ All data is stored in browser memory (Zustand)
- ✅ No database or backend needed
- ✅ Perfect for prototyping and mobile demos
- ✅ When closed, all data is lost (by design)

## 🚀 For Real Usage

To add real functionality:
1. **Add Backend API**: Create API endpoints
2. **Connect Database**: Use any database service
3. **Add Authentication**: Replace mock auth with real API
4. **Handle Payments**: Integrate payment gateway
5. **Deploy**: Use Netlify, Vercel, or any host

See `API_INTEGRATION.md` for details.

## 🎉 Success Checklist

- [ ] Ran `npm install`
- [ ] Ran `npm run dev`
- [ ] App opened in browser
- [ ] Tested signup flow
- [ ] Tested login flow
- [ ] Tested wallet features
- [ ] Tested investment features

## 📞 Need Help?

- Check README.md for features
- Check PAGES.md for page details
- Check troubleshooting section above

## ✨ That's It!

You now have a fully functional mobile investment app. No server setup needed.

Start here: `npm install && npm run dev`

Enjoy! 🚀📱
