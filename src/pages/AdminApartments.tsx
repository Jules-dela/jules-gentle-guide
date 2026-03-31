import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, ExternalLink, Loader2, Pencil } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Apartment {
  id: string;
  link: string;
  description: string | null;
  assigned_client_ids: string[];
  created_at: string;
}

interface ClientOption {
  id: string;
  name: string;
}

export default function AdminApartments() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingApartment, setEditingApartment] = useState<Apartment | null>(null);
  const [clientSearch, setClientSearch] = useState('');

  // Form state
  const [link, setLink] = useState('');
  const [description, setDescription] = useState('');
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) navigate('/auth');
  }, [user, isAdmin, authLoading, navigate]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [aptsRes, casesRes] = await Promise.all([
      supabase.from('apartments').select('*').order('created_at', { ascending: false }),
      supabase.from('cases').select('id, client_id, status, profiles!cases_client_id_fkey(id, name)').neq('status', 'closed'),
    ]);
    if (aptsRes.data) setApartments(aptsRes.data as Apartment[]);
    if (casesRes.data) {
      const activeClients: ClientOption[] = casesRes.data
        .filter((c: any) => c.profiles)
        .map((c: any) => ({ id: c.profiles.id, name: c.profiles.name }));
      // Deduplicate by profile id
      const seen = new Set<string>();
      setClients(activeClients.filter(c => { if (seen.has(c.id)) return false; seen.add(c.id); return true; }));
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openAddDialog = () => {
    setEditingApartment(null);
    setLink(''); setDescription(''); setSelectedClientIds([]); setClientSearch('');
    setDialogOpen(true);
  };

  const openEditDialog = (apt: Apartment) => {
    setEditingApartment(apt);
    setLink(apt.link);
    setDescription(apt.description || '');
    setSelectedClientIds([...apt.assigned_client_ids]);
    setClientSearch('');
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const trimmedLink = link.trim();
    if (!trimmedLink) {
      toast({ title: 'Link is required', variant: 'destructive' });
      return;
    }
    // Validate URL scheme — block javascript:, data:, and other dangerous schemes
    try {
      const url = new URL(trimmedLink);
      if (!['http:', 'https:'].includes(url.protocol)) {
        toast({ title: 'Only http/https links are allowed', variant: 'destructive' });
        return;
      }
    } catch {
      toast({ title: 'Please enter a valid URL', variant: 'destructive' });
      return;
    }
    if (selectedClientIds.length === 0) {
      toast({ title: 'Select at least one client', variant: 'destructive' });
      return;
    }
    setSaving(true);

    const payload = {
      link: link.trim(),
      description: description.trim() || null,
      assigned_client_ids: selectedClientIds,
    };

    if (editingApartment) {
      // Optimistic update for edit
      const optimisticApt = { ...editingApartment, ...payload };
      setApartments(prev => prev.map(a => a.id === editingApartment.id ? optimisticApt : a));
      setDialogOpen(false);
      setEditingApartment(null);

      const { error } = await supabase.from('apartments').update(payload).eq('id', editingApartment.id);
      setSaving(false);
      if (error) {
        // Revert on failure
        setApartments(prev => prev.map(a => a.id === editingApartment.id ? editingApartment : a));
        toast({ title: 'Error updating apartment', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Apartment updated' });
      }
    } else {
      // Optimistic insert with temp id
      const tempId = `temp-${Date.now()}`;
      const optimisticApt: Apartment = { id: tempId, created_at: new Date().toISOString(), ...payload };
      setApartments(prev => [optimisticApt, ...prev]);
      setDialogOpen(false);

      const { data, error } = await supabase.from('apartments').insert(payload).select().single();
      setSaving(false);
      if (error) {
        // Revert on failure
        setApartments(prev => prev.filter(a => a.id !== tempId));
        toast({ title: 'Error saving apartment', description: error.message, variant: 'destructive' });
      } else {
        // Replace temp with real
        setApartments(prev => prev.map(a => a.id === tempId ? data as Apartment : a));
        toast({ title: 'Apartment added' });
      }
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('apartments').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error deleting', description: error.message, variant: 'destructive' });
    } else {
      setApartments(prev => prev.filter(a => a.id !== id));
    }
  };

  const toggleClient = (clientId: string) => {
    setSelectedClientIds(prev =>
      prev.includes(clientId) ? prev.filter(c => c !== clientId) : [...prev, clientId]
    );
  };

  const clientNameMap = new Map(clients.map(c => [c.id, c.name]));

  if (authLoading || (!user || !isAdmin)) return null;

  return (
    <AdminLayout>
      <ErrorBoundary>
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">Apartments</h1>
              <p className="text-sm text-muted-foreground hidden sm:block">Sourced listings for clients</p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingApartment(null); }}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2" onClick={openAddDialog}>
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Add Apartment</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>{editingApartment ? 'Edit Apartment' : 'Add Apartment'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div>
                    <Label htmlFor="apt-link">Link (required)</Label>
                    <Input
                      id="apt-link"
                      type="url"
                      placeholder="https://..."
                      value={link}
                      onChange={e => setLink(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="apt-desc">Short description</Label>
                    <Textarea
                      id="apt-desc"
                      placeholder="Quick summary of the flat..."
                      maxLength={300}
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground mt-1">{description.length}/300</p>
                  </div>
                  <div>
                    <Label>Assign to active clients (required)</Label>
                    <Input
                      placeholder="Search clients..."
                      value={clientSearch}
                      onChange={e => setClientSearch(e.target.value)}
                      className="mt-2"
                    />
                    <div className="mt-1 max-h-48 overflow-y-auto border rounded-md p-2 space-y-1">
                      {clients
                        .filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase()))
                        .map(client => (
                        <label
                          key={client.id}
                          className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted cursor-pointer text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={selectedClientIds.includes(client.id)}
                            onChange={() => toggleClient(client.id)}
                            className="rounded border-input"
                          />
                          {client.name}
                        </label>
                      ))}
                      {clients.filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase())).length === 0 && (
                        <p className="text-sm text-muted-foreground py-2 text-center">No active clients found</p>
                      )}
                    </div>
                  </div>
                  <Button onClick={handleSave} disabled={saving} className="w-full">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {editingApartment ? 'Update Apartment' : 'Save Apartment'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : apartments.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No apartments added yet. Click "Add Apartment" to get started.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {apartments.map(apt => (
                <Card key={apt.id}>
                  <CardContent className="p-4 flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1 space-y-2">
                      <a
                        href={apt.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1 break-all"
                      >
                        {apt.link}
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                      {apt.description && (
                        <p className="text-sm text-muted-foreground">{apt.description}</p>
                      )}
                      <div className="flex flex-wrap gap-1.5">
                        {apt.assigned_client_ids.map(cid => (
                          <Badge key={cid} variant="secondary" className="text-xs">
                            {clientNameMap.get(cid) || 'Unknown'}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-primary"
                        onClick={() => openEditDialog(apt)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(apt.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </ErrorBoundary>
    </AdminLayout>
  );
}
