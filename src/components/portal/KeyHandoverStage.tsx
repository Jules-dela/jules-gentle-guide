import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Key, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  FileText, 
  MessageCircle,
  Building2,
  Wifi,
  Zap,
  CheckCircle,
  Download,
  Award
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SelectedApartment } from './ResearchGallery';

interface KeyHandoverStageProps {
  apartment: SelectedApartment;
  userName?: string;
}

const checklistItems = [
  {
    id: 'commune',
    icon: Building2,
    title: 'Register at the Commune',
    description: "You have 8 days to register at the 'Contrôle des habitants'.",
    completed: false,
  },
  {
    id: 'utilities',
    icon: Zap,
    title: 'Electricity & Water',
    description: 'We have already notified SIL/Services Industriels for you.',
    completed: true,
  },
  {
    id: 'internet',
    icon: Wifi,
    title: 'Internet/WiFi',
    description: "Check our 'Partners' page for the best student fiber deals.",
    completed: false,
  },
];

export function KeyHandoverStage({ apartment, userName = 'New Resident' }: KeyHandoverStageProps) {
  const [journeyComplete, setJourneyComplete] = useState(false);
  const [checkedItems, setCheckedItems] = useState<string[]>(['utilities']);

  const toggleItem = (id: string) => {
    setCheckedItems(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id) 
        : [...prev, id]
    );
  };

  const handleWhatsApp = () => {
    window.open('https://wa.me/41781234567?text=Hello%20Jules,%20I%20would%20like%20to%20coordinate%20my%20arrival.', '_blank');
  };

  const handleDownload = () => {
    // Simulate PDF download
    const link = document.createElement('a');
    link.href = '#';
    link.download = 'lease-agreement.pdf';
    // In production, this would link to actual PDF
    alert('Lease agreement download initiated!');
  };

  const handleAcknowledge = () => {
    setJourneyComplete(true);
  };

  // Get first name from userName
  const firstName = userName.split(' ')[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto space-y-8"
    >
      {/* Celebratory Header */}
      <motion.div 
        className="text-center space-y-4"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <motion.div
          initial={{ rotate: -10 }}
          animate={{ rotate: [0, 10, -10, 5, 0] }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="inline-block"
        >
          <span className="text-5xl">🔑</span>
        </motion.div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">
          Welcome to Your New Home, {firstName}!
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Your application was accepted. We've secured the keys; now let's get you moved in.
        </p>
      </motion.div>

      {/* Handover Details Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <Card className="rounded-[40px] overflow-hidden border-0 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 backdrop-blur-sm shadow-xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-primary/10">
                  <Key className="w-6 h-6 text-primary" />
                </div>
                Move-in Blueprint
              </CardTitle>
              <Badge className="bg-green-500/90 text-white border-0 px-3 py-1">
                <CheckCircle className="w-3 h-3 mr-1" />
                Confirmed
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            {/* Appointment Info */}
            <div className="p-5 rounded-3xl bg-background/80 backdrop-blur-sm border border-border/50 space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                État des Lieux (Entry Inspection)
              </h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Date & Time</p>
                    <p className="font-medium text-foreground">Saturday, Sept 1st at 10:00 AM</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="font-medium text-foreground">{apartment.location || 'Rue de la Louve 12, 1003 Lausanne'}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-primary/5 border border-primary/10">
                <div className="p-2 rounded-xl bg-primary/10">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Meeting Point</p>
                  <p className="font-medium text-foreground">Jules will meet you in front of the main building entrance.</p>
                </div>
              </div>
            </div>

            {/* Property Summary */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/50">
              <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                <img 
                  src={apartment.images[0] || '/placeholder.svg'} 
                  alt="Your new apartment"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">{apartment.neighborhood || 'Lausanne Centre'}</p>
                <p className="text-sm text-muted-foreground">CHF {apartment.rent?.toLocaleString() || '1,850'}/month</p>
                <p className="text-xs text-muted-foreground mt-1">{apartment.rooms} rooms</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* New Resident Checklist */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <Card className="rounded-[40px] border border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              New Resident Checklist
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {checklistItems.map((item, index) => {
              const Icon = item.icon;
              const isChecked = checkedItems.includes(item.id);
              
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  onClick={() => toggleItem(item.id)}
                  className={cn(
                    'flex items-start gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-300',
                    isChecked 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-muted/50 hover:bg-muted border border-transparent'
                  )}
                >
                  <div className={cn(
                    'p-2 rounded-xl transition-colors',
                    isChecked ? 'bg-green-100' : 'bg-background'
                  )}>
                    <Icon className={cn(
                      'w-5 h-5 transition-colors',
                      isChecked ? 'text-green-600' : 'text-muted-foreground'
                    )} />
                  </div>
                  <div className="flex-1">
                    <p className={cn(
                      'font-medium transition-colors',
                      isChecked ? 'text-green-700 line-through' : 'text-foreground'
                    )}>
                      {item.title}
                    </p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {item.description}
                    </p>
                  </div>
                  <div className={cn(
                    'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
                    isChecked 
                      ? 'bg-green-500 border-green-500' 
                      : 'border-muted-foreground/30'
                  )}>
                    {isChecked && <CheckCircle className="w-4 h-4 text-white" />}
                  </div>
                </motion.div>
              );
            })}
          </CardContent>
        </Card>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <Button 
          onClick={handleDownload}
          className="flex-1 h-14 rounded-2xl gap-3 text-base font-medium"
        >
          <Download className="w-5 h-5" />
          Download Lease Agreement (PDF)
        </Button>
        <Button 
          onClick={handleWhatsApp}
          variant="outline"
          className="flex-1 h-14 rounded-2xl gap-3 text-base font-medium border-2 hover:bg-green-50 hover:border-green-300 hover:text-green-700"
        >
          <MessageCircle className="w-5 h-5" />
          Contact Jules for Arrival
        </Button>
      </motion.div>

      {/* Acknowledge Button */}
      {!journeyComplete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center"
        >
          <Button
            onClick={handleAcknowledge}
            variant="ghost"
            className="text-muted-foreground hover:text-primary underline-offset-4 hover:underline"
          >
            I have seen all the details
          </Button>
        </motion.div>
      )}

      {/* Journey Complete Badge */}
      <AnimatePresence>
        {journeyComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', damping: 15 }}
            className="flex justify-center pt-4 pb-8"
          >
            <div className="flex items-center gap-3 px-6 py-4 rounded-full bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10 border border-primary/20">
              <div className="p-2 rounded-full bg-primary">
                <Award className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <p className="font-semibold text-primary">Journey Complete</p>
                <p className="text-xs text-muted-foreground">Welcome to Lausanne!</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
