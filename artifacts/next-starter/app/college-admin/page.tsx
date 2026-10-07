"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getCurrentUserProfile } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

type CollegeRequest = {
  id: string;
  title: string;
  category: string;
  location: string | null;
  priority: string;
  status: string;
  assigned_to: string | null;
  created_at: string;
};

type StaffProfile = {
  id: string;
  full_name: string | null;
  role: string;
  college_id: string;
};

export default function CollegeAdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requests, setRequests] = useState<CollegeRequest[]>([]);
  const [staff, setStaff] = useState<StaffProfile[]>([]);

  useEffect(() => {
    let isCurrent = true;

    async function loadQueue() {
      try {
        const result = await getCurrentUserProfile();

        if (!isCurrent) return;

        if (!result.user) {
          router.replace("/login");
          return;
        }

        if (result.error) {
          setError("Unable to load your college profile.");
          setLoading(false);
          return;
        }

        if (!result.profile || !result.college) {
          setError("Unable to load your college profile.");
          setLoading(false);
          return;
        }

        if (result.profile.role !== "college_admin") {
          setError("You are not authorized to access the college admin queue.");
          setLoading(false);
          return;
        }

        const collegeId = result.profile.college_id;
        const [requestResult, staffResult] = await Promise.all([
          supabase
            .from("requests")
            .select(
              "id, title, category, location, priority, status, assigned_to, created_at",
            )
            .eq("college_id", collegeId)
            .order("created_at", { ascending: false }),
          supabase
            .from("profiles")
            .select("id, full_name, role, college_id")
            .eq("college_id", collegeId)
            .eq("role", "staff"),
        ]);

        if (!isCurrent) return;

        if (requestResult.error || staffResult.error) {
          setError("Unable to load the college admin queue.");
          setLoading(false);
          return;
        }

        setRequests(requestResult.data ?? []);
        setStaff(staffResult.data ?? []);
        setLoading(false);
      } catch {
        if (!isCurrent) return;

        setError("Unable to load the college admin queue.");
        setLoading(false);
      }
    }

    void loadQueue();

    return () => {
      isCurrent = false;
    };
  }, [router]);

  const mainStyle = {
    maxWidth: "48rem",
    margin: "0 auto",
    padding: "1rem",
  };

  if (loading) {
    return (
      <main style={mainStyle}>
        <h1>College Admin Request Queue</h1>
        <p>Loading requests...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main style={mainStyle}>
        <h1>College Admin Request Queue</h1>
        <p role="alert">{error}</p>
      </main>
    );
  }

  return (
    <main style={mainStyle}>
      <h1>College Admin Request Queue</h1>

      {requests.length === 0 ? (
        <p>No requests found.</p>
      ) : (
        <section aria-label="College requests">
          {requests.map((request) => {
            const assignedStaffName =
              request.assigned_to === null
                ? "Unassigned"
                : staff.find(
                    (staffMember) => staffMember.id === request.assigned_to,
                  )?.full_name?.trim() || "Assigned staff unavailable";

            return (
              <article
                key={request.id}
                style={{
                  border: "1px solid #d8e0dd",
                  borderRadius: "0.5rem",
                  marginBottom: "1rem",
                  padding: "1rem",
                }}
              >
                <h2>{request.title}</h2>
                <p>Category: {request.category}</p>
                <p>Location: {request.location ?? "Not provided"}</p>
                <p>Priority: {request.priority}</p>
                <p>Status: {request.status}</p>
                <p>Assigned staff: {assignedStaffName}</p>
                <p>Submitted: {new Date(request.created_at).toLocaleString()}</p>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
