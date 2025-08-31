import { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const location = useLocation();
  const isAuthed = typeof window !== "undefined" && !!localStorage.getItem("thumbforge_auth");

  useEffect(() => {
    // No-op effect to satisfy potential future side-effects
  }, [location.pathname]);

  if (!isAuthed) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
