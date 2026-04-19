// Hook for getting current user from session
// This is a client-side hook for accessing session information

import { useEffect, useState } from "react";
import { validateSession } from "./session";

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
}

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const refetch = () => setRefetchTrigger(prev => prev + 1);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include", // Include cookies
          cache: "no-store",
        });

        if (!response.ok) {
          // Even if the request fails, we might still have a valid session
          // so we'll set loading to false to show the page
          setLoading(false);
          return;
        }

        const data = await response.json();

        if (data.success && data.user) {
          setUser(data.user);
        } else {
          // Request succeeded but didn't return user data
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
        // Don't set error state, just continue
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [refetchTrigger]);

  return { user, loading, error, refetch };
}
