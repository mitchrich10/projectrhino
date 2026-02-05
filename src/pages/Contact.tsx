import { FC, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { RhinoButton } from "@/components/RhinoButton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, Loader2, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Contact: FC = () => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      setFileName(selectedFile.name);
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const name = formData.get("name") as string;
      const email = formData.get("email") as string;
      const message = formData.get("message") as string;

      // Upload file if present
      if (file) {
        const fileExt = file.name.split(".").pop();
        const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("contact-uploads")
          .upload(uniqueFileName, file);

        if (uploadError) {
          console.error("File upload error:", uploadError);
          // Continue without file - still send email
        }
      }

      // Send email via edge function
      const { error } = await supabase.functions.invoke("send-contact-email", {
        body: {
          name,
          email,
          message,
          fileName: fileName || undefined,
        },
      });

      if (error) {
        throw error;
      }

      setIsSubmitted(true);
      toast.success("Your message has been sent!");
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation variant="light" />
        
        <main className="pt-32 pb-20 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <CheckCircle className="w-16 h-16 text-primary mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-primary leading-tight mb-4">
              Thank You
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              We've received your message and will get back to you soon.
            </p>
            <RhinoButton onClick={() => setIsSubmitted(false)}>
              Send Another Message
            </RhinoButton>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation variant="light" />
      
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-[1fr_2fr] gap-12 md:gap-20">
            {/* Heading */}
            <div>
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-primary leading-tight">
                We Want to Hear From You
              </h1>
            </div>

            {/* Form */}
            <div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest">
                      Name
                    </Label>
                    <Input 
                      id="name" 
                      name="name"
                      type="text" 
                      className="bg-white border-border focus:border-primary"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest">
                      Email
                    </Label>
                    <Input 
                      id="email" 
                      name="email"
                      type="email" 
                      className="bg-white border-border focus:border-primary"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-xs font-bold uppercase tracking-widest">
                    In a few sentences, tell us about your business, what stage you're at, your revenue model, and what traction you've achieved.
                  </Label>
                  <Textarea 
                    id="message"
                    name="message"
                    className="bg-white border-border focus:border-primary min-h-[160px] resize-none"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4">
                  <div className="flex items-center gap-4">
                    <label 
                      htmlFor="file-upload" 
                      className={`flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground cursor-pointer hover:bg-primary/90 transition-colors font-bold text-xs uppercase tracking-widest ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload File</span>
                    </label>
                    <input 
                      id="file-upload" 
                      type="file" 
                      className="hidden"
                      onChange={handleFileChange}
                      disabled={isSubmitting}
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.png,.jpg,.jpeg"
                    />
                    <span className="text-xs text-muted-foreground">
                      {fileName || "PDF, slides, docs (max 10MB)"}
                    </span>
                  </div>

                  <RhinoButton type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Sending...
                      </>
                    ) : (
                      "Submit"
                    )}
                  </RhinoButton>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
