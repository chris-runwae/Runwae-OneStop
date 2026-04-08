import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Redirects to `to` once the auth session is confirmed.
 * Use on any page that should forward an authenticated user elsewhere
 * (e.g. login → overview, verify-account → overview).
 */
export function useAuthRedirect(to: string) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push(to);
    }
  }, [user, isLoading, router, to]);
}
