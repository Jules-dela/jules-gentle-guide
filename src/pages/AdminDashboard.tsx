import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { StatCards, StatFilter } from '@/components/admin/StatCards';
import { ClientsTable } from '@/components/admin/ClientsTable';
import { NotificationFeed } from '@/components/admin/NotificationFeed';
import { ClientSidePanel } from '@/components/admin/ClientSidePanel';
import { NotificationBell } from '@/components/admin/NotificationBell';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { RefreshCw, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ClientWithCase } from '@/types/admin';

export default function AdminDashboard() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { clients, interactions, stats, loading, error, refetch, clearInteractions } = useAdminDashboard();
  const [selectedClient, setSelectedClient] = useState<ClientWithCase | null>(null);
  const [showNotifications, setShowNotifications] = useState(true);
  const [statFilter, setStatFilter] = useState<StatFilter>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/auth');
    }
  }, [user, isAdmin, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <AdminLayout>
      <ErrorBoundary>
      <div className="space-y-4 sm:space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Overview</h1>
            <p className="text-sm text-muted-foreground hidden sm:block">Track all student housing searches</p>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell interactions={interactions} onMarkAllRead={clearInteractions} />
            <Button
              variant="outline"
              size="sm"
              onClick={refetch}
              disabled={loading}
              className="gap-2 shrink-0"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>

        {/* Stat Cards */}
        <StatCards
          completed={stats.completed}
          inProgress={stats.inProgress}
          issues={stats.issues}
          dossiersReady={stats.dossiersReady}
          activeFilter={statFilter}
          onFilterChange={setStatFilter}
        />

        {/* Main Content - Stack on mobile, grid on desktop */}
        <div className={cn("grid grid-cols-1 gap-4 sm:gap-6", showNotifications && "lg:grid-cols-3")}>
          {/* Master Table */}
          <div className={cn(showNotifications ? "lg:col-span-2" : "", "order-2 lg:order-1")}>
            <div className="mb-3 sm:mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-foreground">All Students</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Tap to view details
                </p>
              </div>
              {!showNotifications && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNotifications(true)}
                  className="gap-2"
                >
                  <Bell className="h-4 w-4" />
                  <span className="hidden sm:inline">Show Feed</span>
                </Button>
              )}
            </div>
            <ClientsTable
              clients={clients}
              onClientClick={setSelectedClient}
              isLoading={loading}
              statFilter={statFilter}
            />
          </div>

          {/* Notification Feed - Shows first on mobile */}
          {showNotifications && (
            <div className="lg:col-span-1 order-1 lg:order-2">
              <NotificationFeed 
                interactions={interactions} 
                isLoading={loading}
                className="h-64 sm:h-80 lg:h-[500px]"
                onDismiss={() => setShowNotifications(false)}
                onMarkAllRead={clearInteractions}
              />
            </div>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-destructive text-sm">
            {error}
          </div>
        )}
      </div>

      </ErrorBoundary>

      {/* Client Side Panel */}
      <ErrorBoundary>
        <ClientSidePanel
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
          onStatusChange={refetch}
        />
      </ErrorBoundary>
    </AdminLayout>
  );
}
