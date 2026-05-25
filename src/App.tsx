import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";
import Index from "./pages/Index"; // keep landing page eager for fast first paint

// Lazy-loaded routes — each becomes its own chunk so the initial bundle stays small
const Contact = lazy(() => import("./pages/Contact"));
const PartnerLogin = lazy(() => import("./pages/PartnerLogin"));
const Portal = lazy(() => import("./pages/Portal"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const AdminHub = lazy(() => import("./pages/admin/AdminHub"));
const OptionModeller = lazy(() => import("./pages/OptionModeller"));
const FinancingGuide = lazy(() => import("./pages/FinancingGuide"));
const InvestmentBriefBuilder = lazy(() => import("./pages/InvestmentBriefBuilder"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const RouteFallback = () => (
  <div className="min-h-screen bg-[#F4F7FA] flex items-center justify-center">
    <Loader2 className="w-8 h-8 animate-spin text-[#1A7EC8]" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<RouteFallback />}>
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
            <Route path="/fundraising" element={<FinancingGuide />} />
            <Route path="/investment-brief" element={<InvestmentBriefBuilder />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
