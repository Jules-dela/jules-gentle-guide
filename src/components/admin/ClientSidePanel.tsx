import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Phone, MapPin, CreditCard, Calendar, FileText, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type { ClientWithCase } from '@/types/admin';

interface ClientSidePanelProps {
  client: ClientWithCase | null;
  onClose: () => void;
}

const stageLabels: Record<string, string> = {
  request_received: 'Request Received',
  search_in_progress: 'Search In Progress',
  proposals_available: 'Proposals Available',
  visit_in_progress: 'Visit In Progress',
  documents_preparation: 'Documents Preparation',
  application_review: 'Application Review',
  key_handover_scheduled: 'Key Handover Scheduled',
  closed: 'Completed',
};

export function ClientSidePanel({ client, onClose }: ClientSidePanelProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <AnimatePresence>
      {client && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-background border-l shadow-2xl z-50"
          >
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-6 border-b">
              <h2 className="font-semibold text-lg">Client Details</h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <ScrollArea className="h-[calc(100%-4rem)]">
              <div className="p-6">
                {/* Client Info */}
                <div className="flex items-center gap-4 mb-6">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xl font-semibold">
                      {getInitials(client.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">{client.name}</h3>
                    <p className="text-sm text-muted-foreground">{client.client_type || 'Student'}</p>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${client.email}`} className="text-primary hover:underline">
                      {client.email}
                    </a>
                  </div>
                  {client.phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a href={`tel:${client.phone}`} className="text-primary hover:underline">
                        {client.phone}
                      </a>
                    </div>
                  )}
                </div>

                <Separator className="my-6" />

                {/* Current Status */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-foreground mb-3">Current Stage</h4>
                  <Badge variant="secondary" className="text-sm">
                    {stageLabels[client.case_status] || client.case_status}
                  </Badge>
                </div>

                {/* Criteria Summary */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-foreground mb-3">Search Criteria</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Budget:</span>
                      <span className="font-medium">{client.budget || 'Not set'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Area:</span>
                      <span className="font-medium">{client.neighbourhood || 'Any'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Home className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Rooms:</span>
                      <span className="font-medium">{client.rooms || 'Any'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="font-medium">{client.duration || 'Flexible'}</span>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Actions */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-foreground mb-3">Quick Actions</h4>
                  <Button className="w-full justify-start gap-2" variant="outline">
                    <FileText className="h-4 w-4" />
                    Upload Visit Photos
                  </Button>
                  <Button className="w-full justify-start gap-2" variant="outline">
                    <Home className="h-4 w-4" />
                    Add Property Proposal
                  </Button>
                  <Button className="w-full justify-start gap-2" variant="outline">
                    <Mail className="h-4 w-4" />
                    Send Notification
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
