# EnVest Pages Documentation

Complete reference for all pages in the EnVest application.

## 🔐 Authentication Pages

### 1. Splash Screen (`/`)
**File**: `client/pages/Splash.tsx`

Welcome screen that auto-redirects to onboarding after 2 seconds.
- Shows app branding (EnVest logo and tagline)
- Gradient background
- Auto-navigation to onboarding

### 2. Onboarding (`/onboarding`)
**File**: `client/pages/Onboarding.tsx`

Introduction carousel showing app features.
- Displays feature slides
- "Create Account" button
- "Login" button
- Progress indicators

### 3. Create Account (`/create-account`)
**File**: `client/pages/CreateAccount.tsx`

User registration form.
- Email input
- First name input
- Last name input
- Phone number input
- Password input
- Form validation
- Error messages
- Link to login page

**Form Validation**:
- Email is required
- First name is required
- Last name is required
- Password is required
- Phone number is required

### 4. Email Verification (`/verify-email`)
**File**: `client/pages/VerifyEmail.tsx`

OTP email verification screen.
- 6-digit OTP input (auto-advance between fields)
- Resend code option
- Backspace to previous field
- Submit on complete

### 5. KYC Verification (`/kyc`)
**File**: `client/pages/KYC.tsx`

Multi-step Know Your Customer verification (3 steps).

**Step 1: Verification**
- Country of origin dropdown
- ID type selection
- ID number input
- BVN input (optional)

**Step 2: Bank Details**
- Bank name dropdown
- Account number input

**Step 3: Success**
- Success message
- Proceed to home

**Supported Countries**: Nigeria, Ghana, Kenya, South Africa, Uganda

**ID Types**: National ID, Passport, Driver License

**Banks**: First Bank, Zenith Bank, Access Bank, GT Bank, UBA

## 🔑 Login & Password Pages

### 6. Login (`/login`)
**File**: `client/pages/Login.tsx`

User login screen.
- Email input
- Password input
- "Forgot password?" link
- Login button
- "Use Face ID" option
- Link to create account
- Form validation

### 7. Forgot Password (`/forgot-password`)
**File**: `client/pages/ForgotPassword.tsx`

Password recovery initiation.
- Email input
- "Send Reset Code" button
- Link back to login

### 8. Reset Password (`/reset-password`)
**File**: `client/pages/ResetPassword.tsx`

Multi-step password reset flow.

**Step 1: Email**
- Email input
- Submit to receive code

**Step 2: OTP Verification**
- 6-digit OTP input
- Verify button

**Step 3: New Password**
- New password input
- Confirm password input
- Reset button

**Step 4: Success**
- Success message
- Redirect to login

### 9. Face ID Login (`/face-id`)
**File**: `client/pages/FaceID.tsx`

Biometric authentication screen.
- Face scanning visualization
- Status: Scanning → Recognized → Failed
- Retry button (on failure)
- Use Email Login fallback
- Success redirect to home

## 📱 Main App Pages

### 10. Home/Dashboard (`/home`)
**File**: `client/pages/Home.tsx`

Main application dashboard.

**Features**:
- User greeting with name and email
- Logout button
- Portfolio value card (yellow background)
- Total invested amount
- Monthly gains percentage
- Action buttons:
  - Fund NGN Wallet
  - Deposit USD Wallet
- Wallet balance display (NGN and USD)
- My Investments section
  - Stock listings with symbols
  - Current amounts
  - Percentage change (green for gains)
  - "View all" link
- Transaction history section
- Empty state with CTA to fund wallet

## 💳 Wallet Pages

### 11. Fund NGN Wallet (`/fund-ngn-wallet`)
**File**: `client/pages/FundNGNWallet.tsx`

Add funds to NGN wallet.

**Step 1: Amount Selection**
- Amount input
- Quick amount buttons (₦5K, ₦10K, ₦25K, ₦50K)
- Continue button

**Step 2: Payment Method**
- Display amount summary
- Payment method options:
  - Bank Transfer
  - Card
  - USSD
- Back button

### 12. Deposit USD Wallet (`/deposit-usd-wallet`)
**File**: `client/pages/DepositUSDWallet.tsx`

Add funds to USD wallet.

**Step 1: Amount Selection**
- Amount input
- Quick amount buttons ($100, $250, $500, $1000)
- Continue button

**Step 2: Payment Method**
- Display amount summary
- Payment method options:
  - Credit Card
  - Debit Card
  - Bank Transfer
- Back button

### 13. Payment Gateway (`/payment-gateway`)
**File**: `client/pages/PaymentGateway.tsx`

Payment processing screen.

**Step 1: Card Details**
- Card number input (formatted)
- Expiry date input (MM/YY)
- CVV input (3 digits)
- Continue button

**Step 2: OTP Verification**
- 4-digit OTP input
- Verify button

**Step 3: Success**
- Success checkmark
- Amount confirmation
- Done button (redirects to home)

**Input Formatting**:
- Card number: Auto-spaces every 4 digits
- Expiry: Auto-formats as MM/YY
- CVV: Numbers only, 3 digits max

## 📈 Investment Pages

### 14. Invest in NGN Stocks (`/invest-stocks`)
**File**: `client/pages/InvestStocks.tsx`

Stock browsing and investment page.

**Stock List View**:
- 5 Nigerian stocks:
  - SEPLAT Energy (⚡)
  - MTN Nigeria (📱)
  - Guaranty Trust Bank (🏦)
  - Nestle Nigeria (🍽️)
  - BUA Cement (🏗️)
- Each stock shows:
  - Logo/emoji
  - Company name
  - Category/description
  - Current price
  - Percentage change (color-coded)
- Clickable cards to view details

**Stock Detail View**:
- Large stock card with emoji and name
- Current price
- Percentage change
- Amount to invest input
- Calculated shares estimate
- "Invest Now" button
- Back button to stock list

## 🏠 Home Screen Components

### Portfolio Card
- Gradient yellow background
- Total portfolio value in large font
- Monthly percentage gain
- Updated in real-time from Zustand store

### Action Buttons
- Fund NGN button
- Deposit USD button
- Grid layout (2 columns)

### Wallet Balance Cards
- NGN Balance card (dark background)
- USD Balance card (dark background)
- Shows current balance for each currency
- Grid layout (2 columns)

### Investments Section
- Section title with "View all" link
- List of current investments
- Each investment shows:
  - Logo/emoji
  - Name and symbol
  - Amount invested
  - Percentage change (color-coded green/red)

### Transaction History
- Section title
- Empty state message
- CTA button to fund wallet

## 🔄 Navigation Flow

```
Splash (2s auto) → Onboarding
                    ↓
              ┌─────┴─────┐
              ↓           ↓
          Create     Login
          Account        ↓
              ↓       (Face ID)
          Verify Email   ↓
              ↓      Home
              ↓      (Dashboard)
            KYC
              ↓
          Success → Home
                      ↓
          ┌───────────┬────────────┬─────────────┐
          ↓           ↓            ↓             ↓
      Fund NGN   Deposit USD  Invest Stocks  Logout
        ↓           ↓            ↓
    Payment     Payment      (Back to
    Gateway     Gateway       stocks)
        ↓           ↓
      Home        Home
```

## 📊 State Management Integration

### Auth Store
- Used in: Login, Create Account, Face ID, Home
- Stores: User data, authentication status

### Investment Store
- Used in: Home, Fund NGN/USD, Invest Stocks, Payment Gateway
- Stores: Portfolio, wallet balances, investments

### Onboarding Store
- Used in: Create Account, Verify Email, KYC
- Stores: Form data, current step, completed steps

## 🎨 Common UI Patterns

### Input Fields
- Dark background (bg-slate-700)
- Slate border (border-slate-600)
- White text
- Placeholder text in lighter gray

### Buttons
- Primary: Yellow (bg-yellow-400) with dark text
- Secondary: Dark (bg-slate-800) with white text
- Outline: Border with slate color
- Disabled state: Reduced opacity

### Cards
- Dark background (bg-slate-800)
- No border (border-0)
- Rounded corners
- Padding for content

### Text
- Headings: Bold white text
- Body: Slate gray text
- Labels: Slightly lighter gray

## 📱 Responsive Design

All pages are optimized for:
- Mobile devices (320px - 480px)
- Tablets (481px - 768px)
- Desktop (769px+)

Max width containers: 448px (max-w-sm)

## 🔐 Protected Routes

Currently not implemented but recommended:
- `/home` - Requires authentication
- `/fund-ngn-wallet` - Requires authentication
- `/deposit-usd-wallet` - Requires authentication
- `/invest-stocks` - Requires authentication
- `/payment-gateway` - Requires authentication

Implement with React Router's ProtectedRoute component.

## 🚀 Adding New Pages

1. Create component in `client/pages/NewPage.tsx`
2. Add route in `client/App.tsx`:
   ```typescript
   <Route path="/new-page" element={<NewPage />} />
   ```
3. Import at top of App.tsx
4. Add navigation links from relevant pages

## 📝 Page Configuration

Each page can be customized:
- Colors: Edit Tailwind classes
- Text: Update string literals
- Validation: Modify form validation logic
- API calls: Replace mock data with API calls
