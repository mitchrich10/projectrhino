import { FC, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { RhinoButton } from "@/components/RhinoButton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";

const Contact: FC = () => {
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-[1fr_2fr] gap-12 md:gap-20">
            {/* Heading */}
            <div>
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-primary leading-tight">
                We Want to Hear From You!
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
                      type="text" 
                      className="bg-background border-border focus:border-primary"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest">
                      Email
                    </Label>
                    <Input 
                      id="email" 
                      type="email" 
                      className="bg-background border-border focus:border-primary"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-widest">
                    Phone
                  </Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    className="bg-background border-border focus:border-primary max-w-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-xs font-bold uppercase tracking-widest">
                    In a few sentences, tell us about your business, what stage you're at, your revenue model, and what traction you've achieved.
                  </Label>
                  <Textarea 
                    id="message"
                    placeholder="Example Text"
                    className="bg-background border-border focus:border-primary min-h-[160px] resize-none"
                    required
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4">
                  <div className="flex items-center gap-4">
                    <label 
                      htmlFor="file-upload" 
                      className="flex items-center gap-2 px-4 py-2 border border-border rounded cursor-pointer hover:bg-secondary transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      <span className="text-sm font-medium">Upload File</span>
                    </label>
                    <input 
                      id="file-upload" 
                      type="file" 
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <span className="text-xs text-muted-foreground">
                      {fileName || "Max file size 10MB."}
                    </span>
                  </div>

                  <RhinoButton type="submit">
                    Submit
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
