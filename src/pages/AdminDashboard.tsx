import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { LogOut, RefreshCw, Users, Mail, Phone, Home, Calendar, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface HousingApplication {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  university: string | null;
  neighbourhood: string | null;
  budget: string | null;
  rooms: string | null;
  duration: string | null;
  property_type: string | null;
  roommate_preference: string | null;
  furnished: boolean | null;
  near_transport: boolean | null;
  pets_allowed: boolean | null;
  smoking_allowed: boolean | null;
  notes: string | null;
}

export default function AdminDashboard() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const [applications, setApplications] = useState<HousingApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/auth");
    }
  }, [user, isAdmin, loading, navigate]);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("housing_applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          title: "Error fetching applications",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setApplications(data || []);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && isAdmin) {
      fetchApplications();
    }
  }, [user, isAdmin]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const { error } = await supabase
        .from("housing_applications")
        .delete()
        .eq("id", id);

      if (error) {
        toast({
          title: "Error deleting application",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Application deleted",
          description: "The application has been removed.",
        });
        setApplications(applications.filter((app) => app.id !== id));
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
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
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Home className="h-6 w-6" />
            <h1 className="text-xl font-bold">UNIKEY Admin</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm opacity-80 hidden sm:block">{user.email}</span>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSignOut}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Applications
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{applications.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                This Week
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {
                  applications.filter((app) => {
                    const appDate = new Date(app.created_at);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return appDate >= weekAgo;
                  }).length
                }
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Today
              </CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {
                  applications.filter((app) => {
                    const appDate = new Date(app.created_at);
                    const today = new Date();
                    return appDate.toDateString() === today.toDateString();
                  }).length
                }
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Applications Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Housing Applications</CardTitle>
              <CardDescription>
                View and manage all submitted housing applications
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchApplications}
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            {applications.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No applications yet</p>
              </div>
            ) : (
              <ScrollArea className="w-full">
                <div className="min-w-[800px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>University</TableHead>
                        <TableHead>Budget</TableHead>
                        <TableHead>Rooms</TableHead>
                        <TableHead>Preferences</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {applications.map((app) => (
                        <TableRow key={app.id}>
                          <TableCell className="whitespace-nowrap text-sm">
                            {formatDate(app.created_at)}
                          </TableCell>
                          <TableCell className="font-medium">{app.name}</TableCell>
                          <TableCell>
                            <a
                              href={`mailto:${app.email}`}
                              className="text-primary hover:underline flex items-center gap-1"
                            >
                              <Mail className="h-3 w-3" />
                              {app.email}
                            </a>
                          </TableCell>
                          <TableCell>
                            {app.phone ? (
                              <a
                                href={`tel:${app.phone}`}
                                className="text-primary hover:underline flex items-center gap-1"
                              >
                                <Phone className="h-3 w-3" />
                                {app.phone}
                              </a>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>{app.university || "-"}</TableCell>
                          <TableCell>{app.budget || "-"}</TableCell>
                          <TableCell>{app.rooms || "-"}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {app.furnished && (
                                <Badge variant="secondary" className="text-xs">
                                  Furnished
                                </Badge>
                              )}
                              {app.near_transport && (
                                <Badge variant="secondary" className="text-xs">
                                  Transport
                                </Badge>
                              )}
                              {app.pets_allowed && (
                                <Badge variant="secondary" className="text-xs">
                                  Pets OK
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  disabled={deletingId === app.id}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Application?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete the application from {app.name}.
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(app.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
