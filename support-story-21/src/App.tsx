import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Tickets from "./pages/Tickets";
import Executives from "./pages/Executives";
import NotFound from "./pages/NotFound";
import NewTicket from "./pages/NewTicket";
import TicketDetail from "./pages/TicketDetail";
import EditTicket from "./pages/EditTicket";
import TestPage from "./pages/TestPage";
import Diagnostics from "./pages/Diagnostics";
import Settings from "./pages/Settings";
import ApiTestPage from "./pages/ApiTestPage";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/tickets" element={<Tickets />} />
              <Route path="/tickets/new" element={<NewTicket />} />
              <Route path="/tickets/:id" element={<TicketDetail />} />
              <Route path="/tickets/:id/edit" element={<EditTicket />} />
              <Route path="/executives" element={<Executives />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/diagnostics" element={<Diagnostics />} />
              <Route path="/test" element={<TestPage />} />
              <Route path="/api-test" element={<ApiTestPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;