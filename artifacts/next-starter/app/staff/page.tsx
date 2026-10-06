"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUserProfile } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

type Request = {
  id: string;
  title: string;
  category: string;
  location: string | null;
  priority: string;
  status: string;
  created_at: string;
};

export default function StaffPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requests, setRequests] = useState<Request[]>([]);

  useEffect(() => {
    async function loadStaffQueue() {
      const result = await getCurrentUserProfile();

      if (!result.user) {
        router.replace("/login");
        return;
      }

      if (result.error) {
        setError(result.error.message);
        setLoading(false);
        return;
      }

      if (!result.profile || !result.college) {
        setError("Unable to load your CampusFlow profile.");
        setLoading(false);
        return;
      }

      if (result.profile.role !== "staff") {
        setError("You are not authorized to access the staff request queue.");
        setLoading(false);
        return;
      }

      const { data, error: requestsError } = await supabase
        .from("requests")
        .select(
          "id, title, category, location, priority, status, created_at"
        )
        .eq("college_id", result.profile.college_id)
        .order("created_at", { ascending: false });

      if (requestsError) {
        setError(requestsError.message);
        setLoading(false);
        return;
      }

      setRequests(data ?? []);
      setLoading(false);
    }

    loadStaffQueue();
  }, [router]);

  function formatStatus(status: string) {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  function formatCategory(category: string) {
    return category.charAt(0).toUpperCase() + category.slice(1);
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleString();
  }

  if (loading) {
    return <main>Loading staff request queue...</main>;
  }

  if (error) {
    return (
      <main>
        <h1>Staff Request Queue</h1>
        <p>{error}</p>
      </main>
    );
  }

  return (
    <main>
      <h1>Staff Request Queue</h1>

      <p>
        Requests from your college that are currently available for staff
        review.
      </p>

      <p>Total requests: {requests.length}</p>

      {requests.length === 0 ? (
        <p>No requests found.</p>
      ) : (
        <section>
          {requests.map((request) => (
            <article key={request.id}>
              <h2>{request.title}</h2>

              <p>Category: {formatCategory(request.category)}</p>

              <p>
                Location: {request.location || "Not specified"}
              </p>

              <p>Priority: {formatStatus(request.priority)}</p>

              <p>Status: {formatStatus(request.status)}</p>

              <p>Submitted: {formatDate(request.created_at)}</p>

              <button
                onClick={() => router.push(`/request/${request.id}`)}
              >
                View Request
              </button>

              <hr />
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
