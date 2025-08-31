import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, TriangleAlert } from "lucide-react";
import { signinRequest } from "@/apis";

export default function Index() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const authed = localStorage.getItem("thumbforge_auth");
    if (authed) navigate("/dashboard", { replace: true });
  }, [navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await signinRequest({ username, password });
      const token = res?.data?.token;

      if (token) {
        localStorage.setItem(
          "thumbforge_auth",
          JSON.stringify({ u: username, t: Date.now(), token })
        );
        setIsSuccess(true);
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } else {
        setError("Invalid response from server");
      }
    } catch (err: any) {
      console.error("Signin failed:", err);
      setError("Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen grid place-items-center px-4">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-60 [mask-image:radial-gradient(45%_35%_at_50%_20%,black,transparent)]">
        <div className="h-72 bg-gradient-to-r from-[#1E201E] via-[#3C3D37] to-[#697565] blur-3xl" />
      </div>
      <div className="w-full max-w-md">
        <div className="rounded-2xl border bg-card/70 p-8 shadow-xl">
          <h1 className="text-2xl font-bold tracking-tight">Get in</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Access to the dashboard is protected with a fixed key.
          </p>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                autoComplete="username"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
                required
              />
            </div>
            {error && (
              <div className="text-sm text-destructive flex items-center gap-1">
                <TriangleAlert size={16} /> {error}
              </div>
            )}
            {isSuccess && (
              <div className="text-sm text-green-600 flex items-center gap-1">
                <ShieldCheck size={16} /> Get in success
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
