# EnVest Setup Guide

Complete guide to set up and run the EnVest investment app.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js**: v18 or higher
- **pnpm**: v10.14.0 or higher (included in package.json)
- **Git**: For version control

### Check Your Versions

```bash
node --version    # Should be v18+
npm --version     # Should be v9+
pnpm --version    # Should be v10+
```

## 🚀 Quick Start

### 1. Extract/Clone the Project

```bash
# If you downloaded a zip file
unzip envest-app.zip
cd envest-app

# Or clone from git
git clone <repository-url>
cd envest-app
```

### 2. Install Dependencies

```bash
pnpm install
```

This will install all required dependencies including:
- React 18
- TypeScript
- Tailwind CSS
- Zustand
- TanStack Query
- shadcn/ui components
- Express.js

### 3. Run Development Server

```bash
pnpm dev
```

The application will start and be available at:
- **Frontend**: http://localhost:8080
- **API**: http://localhost:8080/api

### 4. Open in Browser

Navigate to `http://localhost:8080` to see the app running.

## 📱 Testing the App

### Default User Flow

1. **Splash Screen** (Auto-redirects after 2 seconds)
2. **Onboarding** - Click "Create Account" or "Login"
3. **Sign Up Path**:
   - Fill in account details
   - Verify email with OTP (any 6 digits)
   - Complete KYC verification
   - Success screen
4. **Login Path**:
   - Use any email/password
   - Or try Face ID login
5. **Dashboard**:
   - View portfolio
   - Fund wallets
   - Browse investments

## 🛠️ Build Commands

### Development
```bash
# Start dev server with hot reload
pnpm dev
```

### Production Build
```bash
# Build for production
pnpm build

# Build client only
pnpm build:client

# Build server only
pnpm build:server
```

### Start Production Server
```bash
# Start the built application
pnpm start
```

### Type Checking
```bash
# Run TypeScript type checking
pnpm typecheck
```

### Testing
```bash
# Run tests with Vitest
pnpm test
```

### Code Formatting
```bash
# Format all code with Prettier
pnpm format.fix
```

## 📁 Project Structure Explained

### `/client` - Frontend Application
```
client/
├── pages/          # Page components
├── stores/         # Zustand state management
├── components/     # Reusable UI components
├── hooks/          # Custom React hooks
├── lib/            # Utility functions
├── App.tsx         # Main app component with routing
├── global.css      # Global styles and theme
└── vite-env.d.ts   # Vite environment types
```

### `/server` - Backend API
```
server/
├── index.ts        # Express server setup
└── routes/         # API route handlers
```

### `/shared` - Shared Code
```
shared/
└── api.ts          # Shared types for client/server
```

## 🎨 Customizing the App

### Change Colors

Edit `client/global.css`:
```css
:root {
  --primary: 222.2 47.4% 11.2%;  /* Change primary color */
  --primary-foreground: 210 40% 98%;
  /* More color variables... */
}
```

Also update `tailwind.config.ts` if needed.

### Add New Pages

1. Create a new file in `client/pages/MyNewPage.tsx`
2. Add the route in `client/App.tsx`:
```typescript
<Route path="/my-new-page" element={<MyNewPage />} />
```

### Add State Management

Create a new Zustand store in `client/stores/myStore.ts`:
```typescript
import { create } from 'zustand';

interface MyState {
  // Your state here
  myValue: string;
  setMyValue: (value: string) => void;
}

export const useMyStore = create<MyState>((set) => ({
  myValue: '',
  setMyValue: (value: string) => set({ myValue: value }),
}));
```

## 🔌 Environment Variables

Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

Edit `.env` with your configuration values.

## 🚢 Deployment

### Deploy to Netlify

1. Build the project: `pnpm build`
2. Connect your Git repository to Netlify
3. Configure build settings:
   - Build command: `pnpm build`
   - Publish directory: `dist/spa`

### Deploy to Vercel

1. Build the project: `pnpm build`
2. Deploy using Vercel CLI: `vercel deploy`
3. Or connect Git repository to Vercel

### Deploy to Docker

```bash
# Build Docker image
docker build -t envest-app .

# Run container
docker run -p 8080:3000 envest-app
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# If port 8080 is busy, you can change it in vite.config.ts
# Or kill the process using the port
lsof -i :8080
kill -9 <PID>
```

### Dependencies Not Installed
```bash
# Clear cache and reinstall
pnpm install --force
```

### TypeScript Errors
```bash
# Run type checking to see issues
pnpm typecheck
```

### Hot Reload Not Working
```bash
# Restart dev server
pnpm dev
```

### Module Not Found Errors
```bash
# Ensure all dependencies are installed
pnpm install

# Clear node_modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## 📚 Learning Resources

### Official Documentation
- [React 18](https://react.dev)
- [TypeScript](https://www.typescriptlang.org)
- [Vite](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Zustand](https://github.com/pmndrs/zustand)
- [TanStack Query](https://tanstack.com/query/latest)

### Component Libraries
- [Radix UI](https://www.radix-ui.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Lucide React Icons](https://lucide.dev)

## 💡 Tips & Best Practices

1. **Use TypeScript**: Leverage full type safety
2. **Component Composition**: Break large components into smaller ones
3. **State Management**: Use Zustand stores for global state
4. **Performance**: Use React Query for server state
5. **Styling**: Prefer Tailwind CSS classes over inline styles
6. **Testing**: Write tests for critical functionality
7. **Formatting**: Run `pnpm format.fix` before committing

## 📞 Support

For issues or questions:
1. Check the README.md for feature overview
2. Review component source code for implementation details
3. Check Vite/React/Zustand documentation
4. Test in the browser's developer tools

## 🎉 Next Steps

1. Run the app locally: `pnpm dev`
2. Explore the different screens
3. Customize colors and branding
4. Connect to real APIs
5. Deploy to your preferred hosting platform

Happy coding! 🚀
