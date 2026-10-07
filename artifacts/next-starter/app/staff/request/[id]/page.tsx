"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getCurrentUserProfile } from "@/lib/auth";
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

export default function StaffRequestDetailsPage() {
  const router = useRouter();
  const params = useParams();

  const [request, setRequest] = useState<RequestDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRequest() {
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
        setError("You are not authorized to access this request.");
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

  function formatStatus(value: string) {
    return value
      .replace(/_/g, " ")
      .replace(/\b\w/g, (character) => character.toUpperCase());
  }

  function formatDate(value: string) {
    return new Date(value).toLocaleString();
  }

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

        <Link href="/staff">← Back to Staff Request Queue</Link>
      </main>
    );
  }

  if (error) {
    return (
      <main>
        <h1>{error === "You are not authorized to access this request." ? "Access Denied" : "Unable to load request"}</h1>
        <p>{error}</p>

        <Link href={error === "You are not authorized to access this request." ? "/dashboard" : "/staff"}>
          ← Back to {error === "You are not authorized to access this request." ? "Dashboard" : "Staff Request Queue"}
        </Link>
      </main>
    );
  }

  if (!request) {
    return null;
  }

  return (
    <main>
      <h1>Staff Request Details</h1>

      <h2>{request.title}</h2>

      <h3>Status</h3>
      <p>● {formatStatus(request.status)}</p>

      <h3>Description</h3>
      <p>{request.description}</p>

      <h3>Request Information</h3>

      <p>Request ID: {request.id}</p>
      <p>Category: {formatStatus(request.category)}</p>
      <p>Location: {request.location ?? "Not provided"}</p>
      <p>Priority: {formatStatus(request.priority)}</p>

      <h3>Dates</h3>

      <p>Submitted: {formatDate(request.created_at)}</p>

      <p>Last Updated: {formatDate(request.updated_at)}</p>

      <Link href="/staff">← Back to Staff Request Queue</Link>
    </main>
  );
}
