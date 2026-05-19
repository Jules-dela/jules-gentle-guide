import { lazy, Suspense, ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index";

const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Auth = lazy(() => import("./pages/Auth"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminWaitlist = lazy(() => import("./pages/AdminWaitlist"));
const AdminApartments = lazy(() => import("./pages/AdminApartments"));
const AdminPaymentLogs = lazy(() => import("./pages/AdminPaymentLogs"));
const Apply = lazy(() => import("./pages/Apply"));
const PortalDashboard = lazy(() => import("./pages/PortalDashboard"));
const PortalProposals = lazy(() => import("./pages/PortalProposals"));
const PortalDocuments = lazy(() => import("./pages/PortalDocuments"));
const PortalHandover = lazy(() => import("./pages/PortalHandover"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

function ProtectedRoute({ children, requireAdmin = false }: { children: ReactNode; requireAdmin?: boolean }) {
  const { user, isAdmin, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  if (requireAdmin && !isAdmin) return <Navigate to="/portal" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ErrorBoundary>
          <Suspense fallback={null}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/login" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/apply" element={<Apply />} />
              <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/apartments" element={<ProtectedRoute requireAdmin><AdminApartments /></ProtectedRoute>} />
              <Route path="/admin/waitlist" element={<ProtectedRoute requireAdmin><AdminWaitlist /></ProtectedRoute>} />
              <Route path="/admin/payment-logs" element={<ProtectedRoute requireAdmin><AdminPaymentLogs /></ProtectedRoute>} />
              <Route path="/portal" element={<ProtectedRoute><PortalDashboard /></ProtectedRoute>} />
              <Route path="/portal/proposals" element={<ProtectedRoute><PortalProposals /></ProtectedRoute>} />
              <Route path="/portal/documents" element={<ProtectedRoute><PortalDocuments /></ProtectedRoute>} />
              <Route path="/portal/handover" element={<ProtectedRoute><PortalHandover /></ProtectedRoute>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          </ErrorBoundary>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
