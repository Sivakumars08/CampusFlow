"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

type SessionUser = {
  email: string | null;
  id: string;
};

export default function AuthStatusPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;

    async function checkSession() {
      try {
        const { data, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (!isCurrent) return;

        if (data.session) {
          setUser({
            email: data.session.user.email ?? null,
            id: data.session.user.id,
          });
        }
      } catch (caughtError) {
        if (!isCurrent) return;

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to check session.",
        );
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    void checkSession();

    return () => {
      isCurrent = false;
    };
  }, []);

  async function handleLogout() {
    setIsLoggingOut(true);
    setLogoutError(null);

    try {
      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        throw signOutError;
      }

      setUser(null);
    } catch (caughtError) {
      setLogoutError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to log out.",
      );
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <main>
      <h1>Authentication status</h1>

      {isLoading ? (
        <p>Checking session...</p>
      ) : error ? (
        <p role="alert">Unable to check session: {error}</p>
      ) : user ? (
        <>
          <p>Session active</p>
          <p>Email: {user.email ?? "Not available"}</p>
          <p>UUID: {user.id}</p>
          {logoutError && <p role="alert">{logoutError}</p>}
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? "Logging out..." : "Log out"}
          </button>
        </>
      ) : (
        <p>No active session</p>
      )}
    </main>
  );
}