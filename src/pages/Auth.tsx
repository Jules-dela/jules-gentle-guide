import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Lock, Mail, ArrowLeft, Copy } from "lucide-react";

const authSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type AuthFormData = z.infer<typeof authSchema>;

const FAKE_CLIENT_EMAIL = "fake.client@uni-key.ch";
const FAKE_CLIENT_PASSWORD = "UniKeyDemo2026!";

export default function Auth() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingDemo, setIsCreatingDemo] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const { signIn, user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const wantsDemo = searchParams.get("demo") === "true";

  const form = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Redirect authenticated users to appropriate dashboard
  useEffect(() => {
    if (!loading && user) {
      if (isAdmin) {
        navigate("/admin");
      } else {
        navigate("/portal");
      }
    }
  }, [user, isAdmin, loading, navigate]);

  const onSubmit = async (data: AuthFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await signIn(data.email, data.password);
      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast({
            title: "Login failed",
            description: "Invalid email or password. Please try again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Login failed",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Call the custom edge function for branded emails
      const { error } = await supabase.functions.invoke("send-password-reset", {
        body: {
          email: resetEmail,
          redirectTo: `${window.location.origin}/reset-password`,
        },
      });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to send reset email. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Check your email",
          description: "We've sent you a password reset link.",
        });
        setIsForgotPassword(false);
        setResetEmail("");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoAccess = async () => {
    setIsCreatingDemo(true);
    try {
      const { data, error } = await supabase.functions.invoke("seed-demo-client", {
        body: { publicDemoAccess: true },
      });

      if (error) throw error;
      if (!data?.session?.access_token || !data?.session?.refresh_token) {
        throw new Error("Demo session was not created.");
      }

      const { error: sessionError } = await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });

      if (sessionError) throw sessionError;

      toast({
        title: "Demo portal ready",
        description: "Opening the fake customer account now.",
      });
      navigate("/portal");
    } catch (err) {
      console.error("Error creating demo account:", err);
      toast({
        title: "Demo access failed",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingDemo(false);
    }
  };

  const fillFakeCredentials = () => {
    form.setValue("email", FAKE_CLIENT_EMAIL, { shouldValidate: true });
    form.setValue("password", FAKE_CLIENT_PASSWORD, { shouldValidate: true });
    setShowPassword(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  // Forgot Password View
  if (isForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary p-4">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="space-y-2 text-center pb-6">
            <CardTitle className="text-2xl font-bold text-primary">
              Reset Password
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter your email address and we'll send you a reset link
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="your@email.com"
                  type="email"
                  className="pl-10"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                />
              </div>
            </div>

            <Button
              onClick={handleForgotPassword}
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send Reset Link"}
            </Button>

            <button
              onClick={() => {
                setIsForgotPassword(false);
                setResetEmail("");
              }}
              className="flex items-center justify-center gap-2 w-full text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="space-y-2 text-center pb-6">
          <CardTitle className="text-2xl font-bold text-primary">
            Portal Login
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {wantsDemo ? "Open a fake customer portal or sign in" : "Sign in to access your portal"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {wantsDemo && (
            <div className="mb-5 rounded-lg border border-primary/20 bg-primary/5 p-4">
              <p className="text-sm font-medium text-foreground mb-3">Fake customer account</p>
              <div className="mb-3 space-y-2 rounded-md bg-background/70 p-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium text-foreground">{FAKE_CLIENT_EMAIL}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Password</span>
                  <span className="font-medium text-foreground">{FAKE_CLIENT_PASSWORD}</span>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                className="mb-3 w-full"
                onClick={fillFakeCredentials}
                disabled={isCreatingDemo || isSubmitting}
              >
                <Copy className="mr-2 h-4 w-4" />
                Fill fake login details
              </Button>
              <Button
                type="button"
                className="w-full"
                onClick={handleDemoAccess}
                disabled={isCreatingDemo || isSubmitting}
              >
                {isCreatingDemo ? "Creating demo..." : "Enter fake client portal"}
              </Button>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="your@email.com"
                          type="email"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-foreground">Password</FormLabel>
                      <button
                        type="button"
                        onClick={() => setIsForgotPassword(true)}
                        className="text-xs text-muted-foreground hover:text-primary transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="••••••••"
                          type={showPassword ? "text" : "password"}
                          className="pl-10 pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Please wait..." : "Sign In"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
