import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/lib/theme-context";
import Navbar from "@/components/Navbar";
import LandingPage from "@/pages/LandingPage";
import SimulationDashboard from "@/pages/SimulationDashboard";
import ComparisonPage from "@/pages/ComparisonPage";
import GreenwashingPage from "@/pages/GreenwashingPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import OrganizationDashboard from "@/pages/OrganizationDashboard";
import AdminPage from "@/pages/AdminPage";
import LoginPage from "@/pages/LoginPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Navbar />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/simulate" element={<SimulationDashboard />} />
              <Route path="/compare" element={<ComparisonPage />} />
              <Route path="/greenwashing" element={<GreenwashingPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/organization" element={<OrganizationDashboard />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
