import ThemeToggle from "./ThemeToggle";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const [count, setCount] = useState<number>(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const read = () => setCount(parseInt(localStorage.getItem("thumbforge_count") || "0", 10));
    read();
    const onCustom = () => read();
    window.addEventListener("storage", read);
    window.addEventListener("thumbforge:count", onCustom as EventListener);
    document.addEventListener("visibilitychange", read);
    return () => {
      window.removeEventListener("storage", read);
      window.removeEventListener("thumbforge:count", onCustom as EventListener);
      document.removeEventListener("visibilitychange", read);
    };
  }, []);

  const isAuthed = !!localStorage.getItem("thumbforge_auth");
  const logout = () => {
    localStorage.removeItem("thumbforge_auth");
    navigate("/");
  };

  return (
    <header className="border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="relative h-7 w-7">
            <span className="absolute inset-0 rounded-md bg-gradient-to-br from-[#1E201E] via-[#3C3D37] to-[#697565] animate-blob" />
          </div>
          <span className="font-extrabold tracking-tight text-lg">ThumbForge</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-muted-foreground select-none">Generates: {count}/10</div>
          <ThemeToggle />
          {isAuthed ? (
            <Button variant="outline" size="sm" onClick={logout} className="ml-1">
              Logout
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
