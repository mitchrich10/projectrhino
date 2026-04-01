import { FC, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, LogOut } from "lucide-react";

interface Props {
  email: string;
}

const RequestAccess: FC<Props> = ({ email }) => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !companyName.trim()) {
      setError("All fields are required.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      // Send notification email via edge function
      await supabase.functions.invoke("request-access", {
        body: {
          item_type: "domain_access",
          item_id: null,
          item_name: `Domain access: ${email.split("@")[1]}`,
          company_name: companyName.trim(),
          requester_name: name.trim(),
          requester_email: email,
        },
      });
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/partner-login");
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F4F7FA] flex flex-col" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <Navigation variant="light" />
        <main className="flex-1 flex items-center justify-center px-6 py-32">
          <div className="w-full max-w-md text-center">
            <CheckCircle className="w-14 h-14 text-[#1A7EC8] mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-[#173660] mb-3">Request Submitted</h1>
            <p className="text-sm text-[#5C6B7A] mb-8">
              We'll review your request and get back to you shortly at <strong>{email}</strong>.
            </p>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#5C6B7A] hover:text-[#173660] transition-colors mx-auto"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7FA] flex flex-col" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <Navigation variant="light" />
      <main className="flex-1 flex items-center justify-center px-6 py-32">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-[#1A7EC8] mb-3">
              Crash Portal
            </p>
            <h1 className="text-3xl font-bold text-[#173660] mb-3">
              Request Access
            </h1>
            <p className="text-sm text-[#5C6B7A] leading-relaxed">
              Your domain isn't currently registered. If you're a Crash company and your team's domain has changed, request access below.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-[#5C6B7A]">Email</Label>
              <Input value={email} disabled className="bg-white border-[#DDE4EC] text-[#173660]" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-[#5C6B7A]">Your Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Smith"
                required
                className="bg-white border-[#DDE4EC] focus:border-[#1A7EC8]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company" className="text-xs font-bold uppercase tracking-widest text-[#5C6B7A]">Company Name</Label>
              <Input
                id="company"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Acme Inc."
                required
                className="bg-white border-[#DDE4EC] focus:border-[#1A7EC8]"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#1A7EC8] text-white text-xs font-bold uppercase tracking-widest px-5 py-3 rounded-lg hover:bg-[#173660] transition-colors disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Request Access
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={handleSignOut}
              className="text-xs font-bold uppercase tracking-widest text-[#5C6B7A] hover:text-[#173660] transition-colors"
            >
              Sign out and use a different account
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RequestAccess;
