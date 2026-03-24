import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { ChevronRight, FileText, Archive, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SignedBadge } from './SignatureViewer';
import type { ClientWithCase } from '@/types/admin';
import type { StatFilter } from './StatCards';

// Document badge component
function DocsBadge({ uploaded, total, pendingReview }: { 
  uploaded: number; 
  total: number; 
  pendingReview: boolean;
}) {
  const isComplete = uploaded >= total && total > 0;
  
  return (
    <div className="relative inline-flex items-center gap-1">
      <span className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
        isComplete ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'
      )}>
        <FileText className="h-3 w-3" />
        {uploaded}/{total}
      </span>
      {pendingReview && (
        <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-blue-500 rounded-full ring-2 ring-background animate-pulse" />
      )}
    </div>
  );
}

// Stage configuration
const stageConfig: Record<string, { label: string; color: string }> = {
  request_received: { label: 'Criteria', color: 'bg-slate-100 text-slate-700' },
  search_in_progress: { label: 'Criteria', color: 'bg-slate-100 text-slate-700' },
  proposals_available: { label: 'Research', color: 'bg-blue-100 text-blue-700' },
  visit_in_progress: { label: 'Visit', color: 'bg-purple-100 text-purple-700' },
  documents_preparation: { label: 'Docs', color: 'bg-orange-100 text-orange-700' },
  application_review: { label: 'Docs', color: 'bg-orange-100 text-orange-700' },
  key_handover_scheduled: { label: 'Handover', color: 'bg-emerald-100 text-emerald-700' },
  closed: { label: 'Archived', color: 'bg-gray-100 text-gray-500' },
};

// Status tag configuration
const statusTagConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  active: { label: 'In Progress', variant: 'secondary' },
  completed: { label: 'Completed', variant: 'default' },
  needs_attention: { label: 'Needs Attention', variant: 'destructive' },
  waiting: { label: 'Waiting', variant: 'outline' },
};

interface ClientsTableProps {
  clients: ClientWithCase[];
  onClientClick: (client: ClientWithCase) => void;
  isLoading?: boolean;
  statFilter?: StatFilter;
}

// Mobile Card View
function ClientCard({ client, onClick }: { client: ClientWithCase; onClick: () => void }) {
  const stageInfo = stageConfig[client.case_status] || { label: 'Unknown', color: 'bg-gray-100 text-gray-700' };
  const statusTag = client.case_status === 'closed' 
    ? statusTagConfig.completed 
    : client.needs_attention 
      ? statusTagConfig.needs_attention 
      : statusTagConfig.active;
  const isArchived = client.case_status === 'closed';

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className={cn(
        "bg-background rounded-lg border p-4 cursor-pointer hover:bg-muted/50 transition-colors active:scale-[0.98]",
        isArchived && "opacity-60"
      )}
    >
      <div className="flex items-start gap-3">
        <Avatar className={cn("h-10 w-10 shrink-0", isArchived && "grayscale")}>
          <AvatarFallback className={cn(
            "text-sm font-medium",
            isArchived ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
          )}>
            {getInitials(client.name)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="font-medium text-foreground truncate flex items-center gap-2">
              {client.name}
              {client.is_contract_signed && <SignedBadge isSigned={true} />}
              {isArchived && <Archive className="h-3.5 w-3.5 text-muted-foreground" />}
            </p>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </div>
          <p className="text-sm text-muted-foreground truncate mb-2">{client.email}</p>
          
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', stageInfo.color)}>
              {stageInfo.label}
            </span>
            <Badge variant={statusTag.variant} className="text-xs">
              {statusTag.label}
            </Badge>
            {!isArchived && (
              <DocsBadge 
                uploaded={client.docs_uploaded} 
                total={client.docs_total}
                pendingReview={client.docs_pending_review}
              />
            )}
          </div>
          
          {!isArchived && (client.budget || client.neighbourhood) && (
            <p className="text-xs text-muted-foreground mt-2">
              {client.budget || 'No budget'} • {client.neighbourhood || 'Any area'}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function ClientsTable({ clients, onClientClick, isLoading, statFilter }: ClientsTableProps) {
  const [filter, setFilter] = useState<'active' | 'archived'>('active');
  const [budgetFilter, setBudgetFilter] = useState<string>('all');
  const [areaFilter, setAreaFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sharingFilter, setSharingFilter] = useState<string>('all');

  // Extract unique values for filter dropdowns
  const [roomsFilter, setRoomsFilter] = useState<string>('all');

  const filterOptions = useMemo(() => {
    const budgets = [...new Set(clients.map(c => c.budget).filter(Boolean))] as string[];
    const areas = [...new Set(clients.map(c => c.neighbourhood).filter(Boolean))] as string[];
    const types = [...new Set(clients.map(c => c.property_type).filter(Boolean))] as string[];
    const rooms = [...new Set(clients.map(c => c.rooms).filter(Boolean))] as string[];
    return { budgets: budgets.sort(), areas: areas.sort(), types: types.sort(), rooms: rooms.sort() };
  }, [clients]);

  const hasActiveFilters = budgetFilter !== 'all' || areaFilter !== 'all' || typeFilter !== 'all' || sharingFilter !== 'all';

  const clearFilters = () => {
    setBudgetFilter('all');
    setAreaFilter('all');
    setTypeFilter('all');
    setSharingFilter('all');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStageInfo = (status: string) => {
    return stageConfig[status] || { label: 'Unknown', color: 'bg-gray-100 text-gray-700' };
  };

  const getStatusTag = (client: ClientWithCase) => {
    if (client.case_status === 'closed') {
      return statusTagConfig.completed;
    }
    if (client.needs_attention) {
      return statusTagConfig.needs_attention;
    }
    return statusTagConfig.active;
  };

  const formatLastActivity = (activity: string | null, timestamp: string | null) => {
    if (!activity || !timestamp) return 'No activity';
    const timeAgo = formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    return `${activity} ${timeAgo}`;
  };

  // Auto-switch tab based on stat filter
  const effectiveTab = statFilter === 'completed' ? 'archived' : filter;

  // Filter clients based on tab + filters
  const activeClients = clients.filter(c => c.case_status !== 'closed');
  const archivedClients = clients.filter(c => c.case_status === 'closed');
  const baseClients = effectiveTab === 'active' ? activeClients : archivedClients;
  
  const displayedClients = useMemo(() => {
    return baseClients.filter(c => {
      // Apply stat filter
      if (statFilter === 'action_required' && !c.needs_attention) return false;
      if (statFilter === 'dossiers_ready' && !c.dossier_submitted) return false;
      // Apply dropdown filters
      if (budgetFilter !== 'all' && c.budget !== budgetFilter) return false;
      if (areaFilter !== 'all' && c.neighbourhood !== areaFilter) return false;
      if (typeFilter !== 'all' && c.property_type !== typeFilter) return false;
      if (sharingFilter !== 'all') {
        const isSharing = c.roommate_preference ? c.roommate_preference.toLowerCase().startsWith('yes') : false;
        if (sharingFilter === 'sharing' && !isSharing) return false;
        if (sharingFilter === 'not_sharing' && isSharing) return false;
      }
      return true;
    });
  }, [baseClients, budgetFilter, areaFilter, typeFilter, sharingFilter, statFilter]);

  if (isLoading) {
    return (
      <div className="bg-background rounded-xl border">
        <div className="p-8 text-center text-muted-foreground">
          Loading clients...
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="space-y-3"
    >
      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as 'active' | 'archived')}>
        <TabsList className="grid w-full max-w-xs grid-cols-2">
          <TabsTrigger value="active" className="gap-2">
            Active
            <Badge variant="secondary" className="ml-1 text-xs">{activeClients.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="archived" className="gap-2">
            <Archive className="h-3.5 w-3.5" />
            Archived
            <Badge variant="secondary" className="ml-1 text-xs">{archivedClients.length}</Badge>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
        <Select value={budgetFilter} onValueChange={setBudgetFilter}>
          <SelectTrigger className="w-[140px] h-8 text-xs">
            <SelectValue placeholder="Budget" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All budgets</SelectItem>
            {filterOptions.budgets.map(b => (
              <SelectItem key={b} value={b}>{b}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={areaFilter} onValueChange={setAreaFilter}>
          <SelectTrigger className="w-[140px] h-8 text-xs">
            <SelectValue placeholder="Area" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All areas</SelectItem>
            {filterOptions.areas.map(a => (
              <SelectItem key={a} value={a}>{a}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[160px] h-8 text-xs">
            <SelectValue placeholder="Property type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {filterOptions.types.map(t => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sharingFilter} onValueChange={setSharingFilter}>
          <SelectTrigger className="w-[140px] h-8 text-xs">
            <SelectValue placeholder="Sharing" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="sharing">Sharing flat</SelectItem>
            <SelectItem value="not_sharing">Not sharing</SelectItem>
          </SelectContent>
        </Select>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2 text-xs gap-1">
            <X className="h-3 w-3" />
            Clear
          </Button>
        )}
        {hasActiveFilters && (
          <span className="text-xs text-muted-foreground">
            {displayedClients.length} result{displayedClients.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {displayedClients.length === 0 ? (
        <div className="bg-background rounded-xl border">
          <div className="p-8 text-center text-muted-foreground">
            {filter === 'active' ? 'No active clients' : 'No archived clients'}
          </div>
        </div>
      ) : (
        <>
          {/* Mobile/Tablet Card View */}
          <div className="md:hidden space-y-3">
            {displayedClients.map((client) => (
              <ClientCard
                key={client.id}
                client={client}
                onClick={() => onClientClick(client)}
              />
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-background rounded-xl border overflow-hidden">
            <ScrollArea className="w-full">
              <div className="min-w-[800px]">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableHead className="font-semibold">Student</TableHead>
                      <TableHead className="font-semibold">Stage</TableHead>
                      {filter === 'active' && <TableHead className="font-semibold">Docs</TableHead>}
                      <TableHead className="font-semibold">{filter === 'active' ? 'Last Activity' : 'Closed Date'}</TableHead>
                      {filter === 'active' && <TableHead className="font-semibold">Criteria</TableHead>}
                      <TableHead className="font-semibold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayedClients.map((client) => {
                      const stageInfo = getStageInfo(client.case_status);
                      const statusTag = getStatusTag(client);
                      const isArchived = client.case_status === 'closed';

                      return (
                        <TableRow
                          key={client.id}
                          onClick={() => onClientClick(client)}
                          className={cn(
                            "cursor-pointer hover:bg-muted/50 transition-colors",
                            isArchived && "opacity-60"
                          )}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className={cn("h-9 w-9", isArchived && "grayscale")}>
                                <AvatarFallback className={cn(
                                  "text-sm font-medium",
                                  isArchived ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
                                )}>
                                  {getInitials(client.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-foreground flex items-center gap-2">
                                  {client.name}
                                  {client.is_contract_signed && <SignedBadge isSigned={true} />}
                                  {isArchived && <Archive className="h-3.5 w-3.5 text-muted-foreground" />}
                                </p>
                                <p className="text-sm text-muted-foreground">{client.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span
                              className={cn(
                                'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
                                stageInfo.color
                              )}
                            >
                              {stageInfo.label}
                            </span>
                          </TableCell>
                          {filter === 'active' && (
                            <TableCell>
                              <DocsBadge 
                                uploaded={client.docs_uploaded} 
                                total={client.docs_total}
                                pendingReview={client.docs_pending_review}
                              />
                            </TableCell>
                          )}
                          <TableCell>
                            <p className="text-sm text-muted-foreground">
                              {formatLastActivity(client.last_activity, client.last_activity_at)}
                            </p>
                          </TableCell>
                          {filter === 'active' && (
                            <TableCell>
                              <div className="text-sm">
                                <span className="text-muted-foreground">
                                  {client.budget || 'No budget'} • {client.neighbourhood || 'Any area'}
                                </span>
                              </div>
                            </TableCell>
                          )}
                          <TableCell>
                            <Badge variant={statusTag.variant}>{statusTag.label}</Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </ScrollArea>
          </div>
        </>
      )}
    </motion.div>
  );
}
