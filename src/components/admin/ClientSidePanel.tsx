import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Phone, MapPin, CreditCard, Calendar, Home, FileText, ChevronDown, ChevronUp, Loader2, GraduationCap, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ApartmentUploader } from './ApartmentUploader';
import { FeedbackTracker } from './FeedbackTracker';
import { VisitReportUploader } from './VisitReportUploader';
import { DocumentManager } from './DocumentManager';
import { HandoverManager } from './HandoverManager';
import { ContractClosurePanel } from './ContractClosurePanel';
import { SignatureViewer, SignedBadge } from './SignatureViewer';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { ClientWithCase } from '@/types/admin';

interface ClientSidePanelProps {
  client: ClientWithCase | null;
  onClose: () => void;
  onStatusChange?: () => void;
}

const caseStatuses = [
  'request_received',
  'search_in_progress',
  'proposals_available',
  'visit_in_progress',
  'documents_preparation',
  'application_review',
  'key_handover_scheduled',
  'closed',
] as const;

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

const neighbourhoodLabels: Record<string, string> = {
  'cite-flon': 'Cité / Flon',
  'sous-gare': 'Sous-Gare',
  'ouchy': 'Ouchy',
  'chailly': 'Chailly',
  'pully': 'Pully',
  'renens': 'Renens',
  'prilly': 'Prilly',
  'morges': 'Morges',
};

const budgetLabels: Record<string, string> = {
  '700-900': 'CHF 700 – 900',
  '900-1100': 'CHF 900 – 1,100',
  '1100-1300': 'CHF 1,100 – 1,300',
  '1300-1500': 'CHF 1,300 – 1,500',
  '1500-1700': 'CHF 1,500 – 1,700',
  '1700-1900': 'CHF 1,700 – 1,900',
  '1900-2100': 'CHF 1,900 – 2,100',
  '2100-2300': 'CHF 2,100 – 2,300',
  '2300-2500': 'CHF 2,300 – 2,500',
  '2500-2700': 'CHF 2,500 – 2,700',
  '2700-2900': 'CHF 2,700 – 2,900',
  '2900+': 'CHF 2,900+',
};

interface FullCriteria {
  budget?: string;
  neighbourhood?: string;
  rooms?: string;
  duration?: string;
  furnished?: boolean;
  nearTransport?: boolean;
  petsAllowed?: boolean;
  smokingAllowed?: boolean;
  propertyType?: string;
  roommatePreference?: string;
  notes?: string;
  movingDate?: string;
  university?: string;
}

export function ClientSidePanel({ client, onClose, onStatusChange }: ClientSidePanelProps) {
  const [criteria, setCriteria] = useState<FullCriteria | null>(null);
  const [loadingCriteria, setLoadingCriteria] = useState(false);
  const [showFullCriteria, setShowFullCriteria] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const handleStatusChange = useCallback(async (newStatus: string) => {
    if (!client?.case_id || newStatus === client.case_status) return;
    setUpdatingStatus(true);
    try {
      const { error } = await supabase
        .from('cases')
        .update({ status: newStatus as typeof caseStatuses[number] })
        .eq('id', client.case_id);
      if (error) throw error;
      toast({ title: 'Status updated', description: `Case moved to "${stageLabels[newStatus]}"` });
      onStatusChange?.();
    } catch (err) {
      console.error('Error updating status:', err);
      toast({ title: 'Error', description: 'Failed to update case status.', variant: 'destructive' });
    } finally {
      setUpdatingStatus(false);
    }
  }, [client?.case_id, client?.case_status, onStatusChange]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Fetch full criteria when client changes
  useEffect(() => {
    if (!client?.case_id) {
      setCriteria(null);
      return;
    }

    const fetchCriteria = async () => {
      setLoadingCriteria(true);
      try {
        const { data, error } = await supabase
          .from('cases')
          .select('initial_criteria')
          .eq('id', client.case_id)
          .maybeSingle();

        if (error) throw error;
        setCriteria(data?.initial_criteria as FullCriteria | null);
      } catch (err) {
        console.error('Error fetching criteria:', err);
      } finally {
        setLoadingCriteria(false);
      }
    };

    fetchCriteria();
  }, [client?.case_id]);

  const handleRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  const formatBudget = (budget?: string) => {
    if (!budget) return 'Not set';
    return budgetLabels[budget] || budget;
  };

  const formatNeighbourhood = (neighbourhood?: string) => {
    if (!neighbourhood) return 'Any';
    return neighbourhoodLabels[neighbourhood] || neighbourhood;
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
            className="fixed right-0 top-0 h-full w-full max-w-lg bg-background border-l shadow-2xl z-50"
          >
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-4 sm:px-6 border-b bg-background">
              <h2 className="font-semibold text-lg">Client Details</h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <ScrollArea className="h-[calc(100%-4rem)]">
              <div className="p-4 sm:p-6 space-y-6">
                {/* Client Info */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14 sm:h-16 sm:w-16">
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg sm:text-xl font-semibold">
                      {getInitials(client.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg sm:text-xl font-semibold text-foreground truncate">{client.name}</h3>
                      {client.is_contract_signed && <SignedBadge isSigned={true} />}
                    </div>
                    <p className="text-sm text-muted-foreground">{client.client_type || 'Student'}</p>
                    {client.case_id ? (
                      <Select
                        value={client.case_status}
                        onValueChange={handleStatusChange}
                        disabled={updatingStatus}
                      >
                        <SelectTrigger className="h-7 w-auto text-xs mt-1 gap-1">
                          {updatingStatus ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <SelectValue />
                          )}
                        </SelectTrigger>
                        <SelectContent>
                          {caseStatuses.map((status) => (
                            <SelectItem key={status} value={status} className="text-xs">
                              {stageLabels[status]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant="secondary" className="text-xs mt-1">
                        No case
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                    <a href={`mailto:${client.email}`} className="text-primary hover:underline truncate">
                      {client.email}
                    </a>
                  </div>
                  {client.phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                      <a href={`tel:${client.phone}`} className="text-primary hover:underline">
                        {client.phone}
                      </a>
                    </div>
                  )}
                </div>

                {/* Contract Signature Status */}
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-foreground">Service Agreement</p>
                    <p className="text-xs text-muted-foreground">
                      {client.is_contract_signed 
                        ? `Signed on ${new Date(client.contract_data?.signed_at || '').toLocaleDateString('en-GB')}`
                        : 'Not yet signed'}
                    </p>
                  </div>
                  <SignatureViewer 
                    contractData={client.contract_data} 
                    clientName={client.name} 
                  />
                </div>

                <Separator />

                {/* Search Criteria Summary */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-foreground">Search Criteria</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFullCriteria(!showFullCriteria)}
                      className="gap-1 h-7 text-xs"
                    >
                      {showFullCriteria ? 'Less' : 'More'}
                      {showFullCriteria ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </Button>
                  </div>

                  {loadingCriteria ? (
                    <div className="py-4 flex justify-center">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <>
                      {/* Main criteria always visible */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-start gap-2 text-sm">
                          <CreditCard className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                          <div>
                            <span className="text-muted-foreground block text-xs">Budget</span>
                            <span className="font-medium">{formatBudget(criteria?.budget || client.budget || undefined)}</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                          <div>
                            <span className="text-muted-foreground block text-xs">Area</span>
                            <span className="font-medium">{formatNeighbourhood(criteria?.neighbourhood || client.neighbourhood || undefined)}</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <Home className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                          <div>
                            <span className="text-muted-foreground block text-xs">Rooms</span>
                            <span className="font-medium">{criteria?.rooms || client.rooms || 'Any'}</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                          <div>
                            <span className="text-muted-foreground block text-xs">Duration</span>
                            <span className="font-medium">{criteria?.duration ? `${criteria.duration} months` : client.duration || 'Flexible'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Extended criteria */}
                      <AnimatePresence>
                        {showFullCriteria && criteria && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="mt-4 pt-4 border-t space-y-3"
                          >
                            <div className="grid grid-cols-2 gap-3">
                              <div className="flex items-start gap-2 text-sm">
                                <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                                <div>
                                  <span className="text-muted-foreground block text-xs">Property Type</span>
                                  <span className="font-medium capitalize">{criteria.propertyType || 'Any'}</span>
                                </div>
                              </div>
                              <div className="flex items-start gap-2 text-sm">
                                <Home className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                                <div>
                                  <span className="text-muted-foreground block text-xs">Roommates</span>
                                  <span className="font-medium">
                                    {criteria.roommatePreference === '0' ? 'None' :
                                     criteria.roommatePreference === '1' ? '1' :
                                     criteria.roommatePreference === '2' ? '2' :
                                     criteria.roommatePreference === '3+' ? '3+' : 'Flexible'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {criteria.furnished && (
                                <Badge variant="outline" className="text-xs">Furnished</Badge>
                              )}
                              {criteria.nearTransport && (
                                <Badge variant="outline" className="text-xs">Near Transport</Badge>
                              )}
                              {criteria.petsAllowed && (
                                <Badge variant="outline" className="text-xs">Pets Allowed</Badge>
                              )}
                              {criteria.smokingAllowed && (
                                <Badge variant="outline" className="text-xs">Smoking OK</Badge>
                              )}
                            </div>

                            {criteria.notes && (
                              <div className="bg-muted/50 rounded-lg p-3">
                                <span className="text-xs text-muted-foreground block mb-1">Notes</span>
                                <p className="text-sm">{criteria.notes}</p>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  )}
                </div>

                <Separator />

                {/* Apartment Uploader */}
                {client.case_id && (
                  <ApartmentUploader 
                    key={`uploader-${refreshKey}`}
                    caseId={client.case_id} 
                    onSave={handleRefresh}
                    clientEmail={client.email}
                    clientName={client.name}
                  />
                )}

                <Separator />

                {/* Feedback Tracker */}
                {client.case_id && (
                  <FeedbackTracker 
                    key={`tracker-${refreshKey}`}
                    caseId={client.case_id} 
                    onClearSearch={handleRefresh}
                  />
                )}

                <Separator />

                {/* Visit Report Uploader */}
                {client.case_id && (
                  <VisitReportUploader
                    key={`visit-${refreshKey}`}
                    caseId={client.case_id}
                    onResetToResearch={handleRefresh}
                    clientEmail={client.email}
                    clientName={client.name}
                  />
                )}

                <Separator />

                {/* Document Manager */}
                {client.case_id && (
                  <DocumentManager
                    key={`docs-${refreshKey}`}
                    caseId={client.case_id}
                    clientName={client.name}
                    onUpdate={handleRefresh}
                  />
                )}

                <Separator />

                {/* Handover Manager - Stage 5 */}
                {client.case_id && (
                  <HandoverManager
                    key={`handover-${refreshKey}`}
                    caseId={client.case_id}
                    clientName={client.name}
                    onUpdate={handleRefresh}
                  />
                )}

                <Separator />

                {/* Contract Closure & Data Deletion */}
                {client.case_id && (
                  <ContractClosurePanel
                    key={`closure-${refreshKey}`}
                    caseId={client.case_id}
                    clientName={client.name}
                    onClose={onClose}
                    onClosed={handleRefresh}
                  />
                )}
              </div>
            </ScrollArea>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
