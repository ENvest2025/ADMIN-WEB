import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFound from "./pages/NotFound";

// Auth Pages — login is the only auth entry point
import Login from "./pages/Login";

// App Pages
import Home from "./pages/Home";
import FundNGNWallet from "./pages/FundNGNWallet";
import DepositUSDWallet from "./pages/DepositUSDWallet";
import PaymentGateway from "./pages/PaymentGateway";
import InvestStocks from "./pages/InvestStocks";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import Overview from "./pages/Dashboard/Overview";
import KYCManagement from "./pages/Dashboard/KYCManagement";
import KYCDetail from "./pages/Dashboard/KYCDetail";
import UserManagement from "./pages/Dashboard/UserManagement";
import UserDetail from "./pages/Dashboard/UserDetail";
import Transactions from "./pages/Dashboard/Transactions";
import TransactionDetail from "./pages/Dashboard/TransactionDetail";
import Withdrawals from "./pages/Dashboard/Withdrawals";
import TransactionFilter from "./pages/Dashboard/TransactionFilter";
import InvestmentProducts from "./pages/Dashboard/InvestmentProducts";
import StockDetail from "./pages/Dashboard/StockDetail";
import AddStock from "./pages/Dashboard/AddStock";
import NGNStocksOverview from "./pages/Dashboard/NGNStocksOverview";       // NEW
import InvestmentNoteDetail from "./pages/Dashboard/InvestmentNoteDetail"; // NEW
import PortfolioManagement from "./pages/Dashboard/PortfolioManagement";
import PortfolioOverview from "./pages/Dashboard/PortfolioOverview";
import InvestmentBreakdown from "./pages/Dashboard/InvestmentBreakdown";
import PortfolioTransactionDetail from "./pages/Dashboard/PortfolioTransactionDetail";
import InvestmentNoteBill from "./pages/Dashboard/InvestmentNoteBill";
import Learn from "./pages/Dashboard/Learn";
import Support from "./pages/Dashboard/Support";
import Settings from "./pages/Dashboard/Settings";
import UserInvestments from "@/pages/Dashboard/UserInvestments";
import UserInvestmentDetail from "@/pages/Dashboard/UserInvestmentDetail";
import InvestmentRequests from "@/pages/Dashboard/InvestmentRequests";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Auth — base domain is the login screen, the only auth entry point */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />

          {/* Dashboard Routes */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Overview />} />

            {/* KYC */}
            <Route path="/dashboard/kyc" element={<KYCManagement />} />
            <Route path="/dashboard/kyc/:kycId" element={<KYCDetail />} />

            {/* Users */}
            <Route path="/dashboard/users" element={<UserManagement />} />
            <Route path="/dashboard/users/:userId" element={<UserDetail />} />

            {/* Transactions */}
            <Route path="/dashboard/transactions" element={<Transactions />} />
            <Route path="/dashboard/transactions/filter" element={<TransactionFilter />} />
            <Route path="/dashboard/withdrawals" element={<Withdrawals />} />
            <Route path="/dashboard/transactions/:transactionId" element={<TransactionDetail />} />

            {/* ─── Investment Products ─────────────────────────────────────── */}

            {/* 1. Main product list (Stocks tab + Investment Notes tab) */}
            <Route path="/dashboard/investments" element={<InvestmentProducts />} />

            {/* 2. Stocks: Overview page with stats + table (NGN or US) */}
            <Route path="/dashboard/investments/stocks-overview/:productId" element={<NGNStocksOverview />} />

            {/* 3. Stocks: Add new stock (3-step wizard) */}
            <Route path="/dashboard/investments/:productId/add" element={<AddStock />} />

            {/* 4. Stocks: Individual stock detail (Basic Info / Financials / News / Buy-Sell) */}
            <Route path="/dashboard/investments/stocks-overview/:productId/stock/:stockId" element={<StockDetail />} />
            <Route path="/dashboard/investments/stocks-overview/:productId/stock/:stockId/edit" element={<AddStock />} />

            {/* 5. Investment Notes: Tenure options detail page */}
            <Route path="/dashboard/investments/notes/:noteId" element={<InvestmentNoteDetail />} />

            {/* Legacy routes kept for backward-compat */}
            <Route path="/dashboard/investments/:stockId" element={<StockDetail />} />
            <Route path="/dashboard/investments/:stockId/edit" element={<AddStock />} />

            {/* ─────────────────────────────────────────────────────────────── */}

            {/* Portfolio Management */}
            <Route path="/dashboard/portfolio" element={<PortfolioManagement />} />
            <Route path="/dashboard/portfolio/transaction/:txId" element={<PortfolioTransactionDetail />} />
            <Route path="/dashboard/portfolio/:userId" element={<PortfolioOverview />} />
            <Route path="/dashboard/portfolio/:userId/investment/:investmentId" element={<InvestmentBreakdown />} />
            <Route path="/dashboard/portfolio/:userId/investment/:investmentId/bill" element={<InvestmentNoteBill />} />

            {/* Administration */}
            <Route path="/dashboard/learn" element={<Learn />} />
            <Route path="/dashboard/support" element={<Support />} />
            <Route path="/dashboard/settings" element={<Settings />} />
            <Route path="/dashboard/user-investments" element={<UserInvestments />} />
            <Route path="/dashboard/user-investments/:investmentId" element={<UserInvestmentDetail />} />
            <Route path="/dashboard/requests" element={<InvestmentRequests />} />
          </Route>

          {/* App Routes */}
          <Route path="/home" element={<Home />} />
          <Route path="/fund-ngn-wallet" element={<FundNGNWallet />} />
          <Route path="/deposit-usd-wallet" element={<DepositUSDWallet />} />
          <Route path="/payment-gateway" element={<PaymentGateway />} />
          <Route path="/invest-stocks" element={<InvestStocks />} />

          {/* Catch All */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);