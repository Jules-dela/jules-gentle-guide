import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { StatCards } from '@/components/admin/StatCards';
import { ClientsTable } from '@/components/admin/ClientsTable';
import { NotificationFeed } from '@/components/admin/NotificationFeed';
import { ClientSidePanel } from '@/components/admin/ClientSidePanel';
import { NotificationBell } from '@/components/admin/NotificationBell';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import type { ClientWithCase } from '@/types/admin';

export default function AdminDashboard() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { clients, interactions, stats, loading, error, refetch } = useAdminDashboard();
  const [selectedClient, setSelectedClient] = useState<ClientWithCase | null>(null);
  const [showNotifications, setShowNotifications] = useState(true);
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
      <div className="space-y-4 sm:space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Overview</h1>
            <p className="text-sm text-muted-foreground hidden sm:block">Track all student housing searches</p>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell interactions={interactions} />
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
        />

        {/* Main Content - Stack on mobile, grid on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Master Table */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <div className="mb-3 sm:mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-foreground">All Students</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Tap to view details
              </p>
            </div>
            <ClientsTable
              clients={clients}
              onClientClick={setSelectedClient}
              isLoading={loading}
            />
          </div>

          {/* Notification Feed - Shows first on mobile */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <NotificationFeed 
              interactions={interactions} 
              isLoading={loading}
              className="h-64 sm:h-80 lg:h-[500px]"
            />
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-destructive text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Client Side Panel */}
      <ClientSidePanel
        client={selectedClient}
        onClose={() => setSelectedClient(null)}
        onStatusChange={refetch}
      />
    </AdminLayout>
  );
}
