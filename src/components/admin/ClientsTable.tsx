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
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import type { ClientWithCase } from '@/types/admin';

// Stage configuration
const stageConfig: Record<string, { label: string; color: string }> = {
  request_received: { label: 'Criteria', color: 'bg-slate-100 text-slate-700' },
  search_in_progress: { label: 'Criteria', color: 'bg-slate-100 text-slate-700' },
  proposals_available: { label: 'Research', color: 'bg-blue-100 text-blue-700' },
  visit_in_progress: { label: 'Visit', color: 'bg-purple-100 text-purple-700' },
  documents_preparation: { label: 'Docs', color: 'bg-orange-100 text-orange-700' },
  application_review: { label: 'Docs', color: 'bg-orange-100 text-orange-700' },
  key_handover_scheduled: { label: 'Handover', color: 'bg-emerald-100 text-emerald-700' },
  closed: { label: 'Completed', color: 'bg-green-100 text-green-700' },
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
}

// Mobile Card View
function ClientCard({ client, onClick }: { client: ClientWithCase; onClick: () => void }) {
  const stageInfo = stageConfig[client.case_status] || { label: 'Unknown', color: 'bg-gray-100 text-gray-700' };
  const statusTag = client.case_status === 'closed' 
    ? statusTagConfig.completed 
    : client.needs_attention 
      ? statusTagConfig.needs_attention 
      : statusTagConfig.active;

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
      className="bg-background rounded-lg border p-4 cursor-pointer hover:bg-muted/50 transition-colors active:scale-[0.98]"
    >
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
            {getInitials(client.name)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="font-medium text-foreground truncate">{client.name}</p>
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
          </div>
          
          {(client.budget || client.neighbourhood) && (
            <p className="text-xs text-muted-foreground mt-2">
              {client.budget || 'No budget'} • {client.neighbourhood || 'Any area'}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function ClientsTable({ clients, onClientClick, isLoading }: ClientsTableProps) {
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

  if (isLoading) {
    return (
      <div className="bg-background rounded-xl border">
        <div className="p-8 text-center text-muted-foreground">
          Loading clients...
        </div>
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="bg-background rounded-xl border">
        <div className="p-8 text-center text-muted-foreground">
          No clients found
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      {/* Mobile/Tablet Card View */}
      <div className="md:hidden space-y-3">
        {clients.map((client) => (
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
                  <TableHead className="font-semibold">Last Activity</TableHead>
                  <TableHead className="font-semibold">Criteria</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => {
                  const stageInfo = getStageInfo(client.case_status);
                  const statusTag = getStatusTag(client);

                  return (
                    <TableRow
                      key={client.id}
                      onClick={() => onClientClick(client)}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                              {getInitials(client.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-foreground">{client.name}</p>
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
                      <TableCell>
                        <p className="text-sm text-muted-foreground">
                          {formatLastActivity(client.last_activity, client.last_activity_at)}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <span className="text-muted-foreground">
                            {client.budget || 'No budget'} • {client.neighbourhood || 'Any area'}
                          </span>
                        </div>
                      </TableCell>
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
    </motion.div>
  );
}
