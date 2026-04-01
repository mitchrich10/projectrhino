import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Contact from "./pages/Contact";
import PartnerLogin from "./pages/PartnerLogin";
import Portal from "./pages/Portal";
import Onboarding from "./pages/Onboarding";
import AdminHub from "./pages/admin/AdminHub";
import OptionModeller from "./pages/OptionModeller";
import FinancingGuide from "./pages/FinancingGuide";
import NotFound from "./pages/NotFound";
import InvestmentBriefBuilder from "./pages/InvestmentBriefBuilder";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/partner-login" element={<PartnerLogin />} />
          <Route path="/portal" element={<Portal />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/admin/resources" element={<AdminHub />} />
          <Route path="/admin" element={<AdminHub />} />
          <Route path="/option-modeller" element={<OptionModeller />} />
          <Route path="/portal/financing-guide" element={<FinancingGuide />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
