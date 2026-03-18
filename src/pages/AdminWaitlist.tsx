import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RefreshCw, Trash2, Phone, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface WaitlistEntry {
  id: string;
  phone: string;
  created_at: string;
}

export default function AdminWaitlist() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/auth');
    }
  }, [user, isAdmin, authLoading, navigate]);

  const fetchEntries = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('waitlist')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load waitlist');
    } else {
      setEntries(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user && isAdmin) fetchEntries();
  }, [user, isAdmin]);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('waitlist').delete().eq('id', id);
    if (error) {
      toast.error('Failed to remove entry');
    } else {
      setEntries((prev) => prev.filter((e) => e.id !== id));
      toast.success('Entry removed');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Waitlist</h1>
            <p className="text-sm text-muted-foreground">
              {entries.length} {entries.length === 1 ? 'person' : 'people'} waiting
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchEntries} disabled={loading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>

        <div className="bg-background rounded-lg border shadow-sm">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground animate-pulse">Loading entries…</div>
          ) : entries.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No waitlist entries yet.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />Phone</div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />Signed up</div>
                  </TableHead>
                  <TableHead className="w-16" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry, i) => (
                  <TableRow key={entry.id}>
                    <TableCell className="text-muted-foreground font-medium">{i + 1}</TableCell>
                    <TableCell className="font-medium">{entry.phone}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(entry.created_at), 'dd MMM yyyy, HH:mm')}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(entry.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
