import { useEffect, useMemo, useState } from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateThumbnail } from "@/apis";

const MAX_GENERATES = 10;

type FormState = {
  category: string;
  customCategory: string;
  focus: string;
  style: string;
  platform: string;
  addons: string;
  image: string;
};

export default function Dashboard() {
  const [form, setForm] = useState<FormState>({
    category: "",
    customCategory: "",
    focus: "",
    style: "",
    platform: "",
    addons: "",
    image: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [count, setCount] = useState(0);
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [cloudUrl, setCloudUrl] = useState<string | null>(null);

  useEffect(() => {
    const initial = parseInt(localStorage.getItem("thumbforge_count") || "0", 10);
    setCount(initial);
  }, []);

  const canGenerate = count < MAX_GENERATES;

  const categoryDisplay = useMemo(() => {
    return form.category === "Other" && form.customCategory.trim()
      ? form.customCategory.trim()
      : form.category;
  }, [form.category, form.customCategory]);

  // Form validation
  const isFormValid = useMemo(() => {
    const requiredFields = [
      image, // Image file is required
      form.category, // Category is required
      form.platform, // Platform is required
      form.focus.trim() // Focus object is required
    ];

    // If category is "Other", custom category is also required
    if (form.category === "Other") {
      requiredFields.push(form.customCategory.trim());
    }

    return requiredFields.every(field => field);
  }, [image, form.category, form.customCategory, form.platform, form.focus]);

  const handleGenerate = async () => {
    if (!canGenerate || !isFormValid) return;
    setIsLoading(true);
    console.log({ ...form, image });
    try {
      const res = await generateThumbnail({ ...form, image });
      setCloudUrl(res.data.url);
      console.log(res.data.url);
    } catch (error) {
      console.log('Error in get thumbnail: ', error);
    }
    setIsLoading(false);
    setPreviewKey((k) => k + 1);
    const next = count + 1;
    setCount(next);
    localStorage.setItem("thumbforge_count", String(next));
    window.dispatchEvent(new Event("thumbforge:count"));
  };

  const handleDownload = async () => {
    if (!cloudUrl) return;

    try {
      const response = await fetch(cloudUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `thumbnail-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.log('Error downloading image: ', error);
    }
  };

  return (
    <div className="container mx-auto py-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardContent className="space-y-5">
          <div className="grid gap-2 mt-6">
            <Label>Upload Image <span className="text-red-500">*</span></Label>
            <div className="rounded-lg border-2 border-dashed border-muted bg-card/50 p-2">
              <Input
                id="upload"
                type="file"
                required={true}
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/heic,image/heif,image/svg+xml"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  setImage(e.target.files[0]);
                  if (f) {
                    const url = URL.createObjectURL(f);
                    if (imageUrl) URL.revokeObjectURL(imageUrl);
                    setImageUrl(url);
                  }
                }}
                className="h-9 w-fit text-xs"
              />
              {imageUrl ? (
                <img src={imageUrl} alt="Upload preview" className="mt-3 h-40 w-full rounded-md object-cover" />
              ) : (
                <div className="mt-3 h-40 w-full grid place-items-center text-sm text-muted-foreground">No image selected</div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 grid gap-2">
              <Label>Category <span className="text-red-500">*</span></Label>
              {form.category === "Other" ? (
                <Input
                  required={true}
                  placeholder="Enter custom category"
                  value={form.customCategory}
                  onChange={(e) => setForm((s) => ({ ...s, customCategory: e.target.value }))}
                />
              ) : (
                <Select
                  value={form.category}
                  required={true}
                  onValueChange={(v) => setForm((s) => ({ ...s, category: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Gaming", "Vlog", "Fashion", "Tech", "Cooking", "Other"].map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="flex-1 grid gap-2">
              <Label>Platform <span className="text-red-500">*</span></Label>
              <Select
                value={form.platform}
                onValueChange={(v) => setForm((s) => ({ ...s, platform: v }))}
                required={true}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="youtube">Youtube [16:9]</SelectItem>
                  <SelectItem value="insta-reel">Insta-reel [9:16]</SelectItem>
                  <SelectItem value="insta-post">Insta-post [1:1]</SelectItem>
                  <SelectItem value="x">X (Twitter) [16:9]</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 grid gap-2">
              <Label>Focus object <span className="text-red-500">*</span></Label>
              <Input
                required={true}
                placeholder="e.g., pizza, dubai, ai"
                value={form.focus}
                onChange={(e) => setForm((s) => ({ ...s, focus: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="addons">Extra addons <span className="text-xs">(optional)</span></Label>
            <div className="flex gap-1">
              <Input
                id="addons"
                placeholder="Any additional instructions..."
                value={form.addons}
                onChange={(e) => setForm((s) => ({ ...s, addons: e.target.value }))}
                className="pr-12"
              />
              <Button
                type="button"
                onClick={handleGenerate}
                disabled={!canGenerate || isLoading || !isFormValid}
                className="w-9 rounded-md"
                size="icon"
                aria-label="Generate"
                title={
                  !canGenerate
                    ? "Limit (10)"
                    : !isFormValid
                      ? "Please fill all required fields"
                      : "Generate"
                }
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" />
                </svg>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="min-h-[28rem] overflow-hidden">
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          {/* @ts-ignore */}
          <style jsx>{`
            @keyframes scan {
              0% { transform: translateY(-100%); }
              50% { transform: translateY(400px); opacity: 1; }
              100% { transform: translateY(500px); opacity: 0; }
            }
            @keyframes float {
              0%, 100% { transform: translateY(0px) rotate(0deg); }
              50% { transform: translateY(-20px) rotate(180deg); }
            }
            @keyframes ripple {
              0% { transform: scale(1); opacity: 1; }
              100% { transform: scale(1.5); opacity: 0; }
            }
          `}</style>
          {isLoading ? (
            <div className="relative grid place-items-center h-96 rounded-xl overflow-hidden bg-gradient-to-br from-[#0a0a0b] via-[#1a1b23] to-[#2d1b69] animate-pulse">
              {/* Animated grid pattern */}
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_20%,rgba(139,92,246,0.3)_0%,transparent_50%),radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.3)_0%,transparent_50%),radial-gradient(circle_at_40%_40%,rgba(236,72,153,0.2)_0%,transparent_50%)]" />

              {/* Moving scan line */}
              <div className="absolute inset-x-0 -top-32 h-32 bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent animate-[scan_3s_ease-in-out_infinite]" />

              {/* Floating particles */}
              <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-blue-400 rounded-full animate-[float_4s_ease-in-out_infinite]" />
              <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-purple-400 rounded-full animate-[float_3s_ease-in-out_infinite_reverse]" />
              <div className="absolute top-1/2 left-3/4 w-1 h-1 bg-pink-400 rounded-full animate-[float_5s_ease-in-out_infinite]" />

              {/* Central loading animation */}
              <div className="relative z-10 grid place-items-center text-white">
                <div className="relative">
                  {/* Outer rotating ring */}
                  <div className="h-20 w-20 rounded-full border-2 border-transparent border-t-cyan-400 border-r-blue-400 animate-spin" />

                  {/* Middle pulsing ring */}
                  <div className="absolute inset-2 rounded-full border-2 border-purple-400/40 animate-ping" />

                  {/* Inner glowing core */}
                  <div className="absolute inset-6 rounded-full bg-gradient-to-br from-cyan-400 to-purple-600 animate-pulse shadow-lg shadow-cyan-400/50" />

                  {/* Center dot */}
                  <div className="absolute inset-8 rounded-full bg-white animate-pulse" />
                </div>

                {/* Loading text with typewriter effect */}
                <div className="mt-6 text-center">
                  <p className="text-lg font-medium text-cyan-300 animate-pulse">Generating preview</p>
                  <div className="flex items-center justify-center mt-2 space-x-1">
                    <div className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce" />
                    <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                    <div className="w-1 h-1 bg-purple-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  </div>
                  <p className="text-xs text-gray-300 mt-2 animate-pulse">Creating your thumbnail...</p>
                </div>
              </div>

              {/* Animated background elements */}
              <div className="absolute -bottom-12 -right-12 h-40 w-40 rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 blur-3xl animate-[float_6s_ease-in-out_infinite]" />
              <div className="absolute -top-16 -left-16 h-32 w-32 rounded-full bg-gradient-to-br from-blue-500/10 to-cyan-500/10 blur-2xl animate-[float_8s_ease-in-out_infinite_reverse]" />
              <div className="absolute top-1/3 right-1/4 h-24 w-24 rounded-full bg-gradient-to-br from-indigo-500/5 to-purple-500/5 blur-xl animate-[float_7s_ease-in-out_infinite]" />
            </div>
          ) : (
            <div key={previewKey} className="grid gap-4">
              {cloudUrl ? (
                <>
                  <img src={cloudUrl} className="rounded-lg" />
                  <Button
                    onClick={handleDownload}
                    className="w-full"
                    variant="outline"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7,10 12,15 17,10" />
                      <line x1="12" x2="12" y1="15" y2="3" />
                    </svg>
                    Download Image
                  </Button>
                </>
              ) : (
                <div className="h-96 rounded-xl border-2 border-dashed border-muted bg-muted/10 grid place-items-center">
                  <div className="text-center space-y-3">
                    <div className="mx-auto h-16 w-16 rounded-full bg-muted/20 grid place-items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-muted-foreground">
                        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                        <circle cx="9" cy="9" r="2" />
                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                      </svg>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">No preview yet</p>
                      <p className="text-xs text-muted-foreground">Fill the form and click generate to see your thumbnail</p>
                    </div>
                  </div>
                </div>
              )}
              <div className="text-sm text-muted-foreground">
                {cloudUrl
                  ? "Generated preview based on your inputs. Adjust the form on the left and generate again to iterate."
                  : "Complete the form on the left to generate your thumbnail preview."
                } Max {MAX_GENERATES} generates per session.
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}