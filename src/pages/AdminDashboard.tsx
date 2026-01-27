import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { StatCards } from '@/components/admin/StatCards';
import { ClientsTable } from '@/components/admin/ClientsTable';
import { NotificationFeed } from '@/components/admin/NotificationFeed';
import { ClientSidePanel } from '@/components/admin/ClientSidePanel';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import type { ClientWithCase } from '@/types/admin';

export default function AdminDashboard() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { clients, interactions, stats, loading, error, refetch } = useAdminDashboard();
  const [selectedClient, setSelectedClient] = useState<ClientWithCase | null>(null);
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
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Overview</h1>
            <p className="text-muted-foreground">Track all student housing searches</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stat Cards */}
        <StatCards
          completed={stats.completed}
          inProgress={stats.inProgress}
          issues={stats.issues}
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Master Table */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-foreground">All Students</h2>
              <p className="text-sm text-muted-foreground">
                Click on a row to view details and manage their search
              </p>
            </div>
            <ClientsTable
              clients={clients}
              onClientClick={setSelectedClient}
              isLoading={loading}
            />
          </div>

          {/* Notification Feed */}
          <div className="lg:col-span-1 h-[500px]">
            <NotificationFeed interactions={interactions} isLoading={loading} />
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
      />
    </AdminLayout>
  );
}
