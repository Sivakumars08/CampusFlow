"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type RequestDetails = {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string | null;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export default function RequestDetailsPage() {
  const router = useRouter();
  const params = useParams();

  const [request, setRequest] = useState<RequestDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRequest() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      if (userError) {
        setError(userError.message);
        setLoading(false);
        return;
      }

      const requestId = params.id;
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

      if (typeof requestId !== "string" || !uuidRegex.test(requestId)) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const { data, error: requestError } = await supabase
        .from("requests")
        .select(
          "id, title, description, category, location, priority, status, created_at, updated_at"
        )
        .eq("id", requestId)
        .maybeSingle();

      if (requestError) {
        setError(requestError.message);
        setLoading(false);
        return;
      }

      if (!data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setRequest(data);
      setLoading(false);
    }

    loadRequest();
  }, [params.id, router]);

  if (loading) {
    return <main>Loading request...</main>;
  }

  if (notFound) {
    return (
      <main>
        <h1>Request not found</h1>

        <p>
          This request may not exist or you may not have permission to view it.
        </p>

        <Link href="/my-requests">Back to My Requests</Link>
      </main>
    );
  }

  if (error) {
    return (
      <main>
        <h1>Unable to load request</h1>
        <p>{error}</p>

        <Link href="/my-requests">Back to My Requests</Link>
      </main>
    );
  }

  if (!request) {
    return null;
  }

  return (
    <main>
      <h1>Request Details</h1>

      <h2>{request.title}</h2>

      <h3>Status</h3>
      <p>● {request.status.replace("_", " ")}</p>

      <h3>Description</h3>
      <p>{request.description}</p>

      <h3>Request Information</h3>

      <p>Category: {request.category}</p>
      <p>Location: {request.location ?? "Not provided"}</p>
      <p>Priority: {request.priority}</p>

      <h3>Dates</h3>

      <p>
        Submitted: {new Date(request.created_at).toLocaleString()}
      </p>

      <p>
        Last Updated: {new Date(request.updated_at).toLocaleString()}
      </p>

      <Link href="/my-requests">← Back to My Requests</Link>
    </main>
  );
}
