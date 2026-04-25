import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CriteriaForm } from "@/components/CriteriaForm";
import { Loader2, ShieldX } from "lucide-react";

type TokenState = "loading" | "valid" | "invalid" | "missing";

const Apply = () => {
  const [searchParams] = useSearchParams();
  const [tokenState, setTokenState] = useState<TokenState>("loading");
  const [tokenValue, setTokenValue] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setTokenState("missing");
      return;
    }

    setTokenValue(token);

    const validate = async () => {
      const { data, error } = await supabase
        .from("waitlist_tokens")
        .select("id, used")
        .eq("token", token)
        .eq("used", false)
        .maybeSingle();

      if (error || !data) {
        setTokenState("invalid");
      } else {
        setTokenState("valid");
      }
    };

    validate();
  }, [searchParams]);

  // Token is marked as used server-side inside send-application-emails after a
  // successful submission, so the frontend no longer needs to do anything here.
  const markTokenUsed = async () => {
    /* no-op — handled server-side */
  };

  if (tokenState === "loading") {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 text-[#c9a84c] animate-spin mx-auto" />
          <p className="text-white/60 text-sm tracking-wide">Verifying your access…</p>
        </div>
      </div>
    );
  }

  if (tokenState === "missing") {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center px-6">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
            <ShieldX className="w-8 h-8 text-[#c9a84c]" />
          </div>
          <h1 className="text-2xl font-bold text-white">Invalid Link</h1>
          <p className="text-white/50 leading-relaxed">
            This link is invalid. Please contact UniKey directly.
          </p>
        </div>
      </div>
    );
  }

  if (tokenState === "invalid") {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center px-6">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
            <ShieldX className="w-8 h-8 text-[#c9a84c]" />
          </div>
          <h1 className="text-2xl font-bold text-white">Link Expired</h1>
          <p className="text-white/50 leading-relaxed">
            This link has already been used or is invalid. Please contact UniKey directly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <CriteriaForm onSubmitSuccess={markTokenUsed} />
    </div>
  );
};

export default Apply;
