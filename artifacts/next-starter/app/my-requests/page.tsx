"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type RequestRow = {
  id: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  location: string | null;
  created_at: string;
};

export default function MyRequestsPage() {
  const router = useRouter();

  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRequests() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        setError(userError.message);
        setLoading(false);
        return;
      }

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data, error: requestsError } = await supabase
        .from("requests")
        .select(
          "id, title, category, priority, status, location, created_at"
        )
        .order("created_at", { ascending: false });

      if (requestsError) {
        setError(requestsError.message);
        setLoading(false);
        return;
      }

      setRequests(data ?? []);
      setLoading(false);
    }

    loadRequests();
  }, [router]);

  if (loading) {
    return <main>Loading your requests...</main>;
  }

  if (error) {
    return <main>Unable to load your requests: {error}</main>;
  }

  return (
    <main>
      <h1>My Requests</h1>

      {requests.length === 0 ? (
        <p>You have not submitted any requests yet.</p>
      ) : (
        <section>
          {requests.map((request) => (
            <article key={request.id}>
              <h2>{request.title}</h2>

              <p>Category: {request.category}</p>
              <p>Priority: {request.priority}</p>
              <p>Status: {request.status}</p>

              {request.location && (
                <p>Location: {request.location}</p>
              )}

              <p>
                Submitted:{" "}
                {new Date(request.created_at).toLocaleString()}
              </p>
            </article>
          ))}
        </section>
      )}

      <br />

      <button onClick={() => router.push("/request/new")}>
        Submit a Request
      </button>
    </main>
  );
}
