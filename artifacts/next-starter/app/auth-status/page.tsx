"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

type SessionUser = {
  email: string | null;
  id: string;
};

export default function AuthStatusPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [error, setError] = useState<string | null>(null);

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
        </>
      ) : (
        <p>No active session</p>
      )}
    </main>
  );
}