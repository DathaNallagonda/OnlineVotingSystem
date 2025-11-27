import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import AdminLogin from "./pages/admin/AdminLogin";
import UserHome from "./pages/UserHome";
import ElectionList from "./pages/ElectionList";
import Vote from "./pages/Vote";
import VoteSuccess from "./pages/VoteSuccess";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminDashboardNew from "./pages/admin/AdminDashboardNew";
import ElectionResults from "./pages/admin/ElectionResults";
import Results from "./pages/Results";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/results" element={<Results />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/reset-password" element={<ResetPassword />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboardNew />} />
          <Route path="/admin/dashboard-old" element={<AdminDashboard />} />
          <Route path="/admin/results/:electionId" element={<ElectionResults />} />
          <Route path="/user/home" element={<UserHome />} />
          <Route path="/elections" element={<ElectionList />} />
          <Route path="/vote/:electionId" element={<Vote />} />
          <Route path="/vote/success" element={<VoteSuccess />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
