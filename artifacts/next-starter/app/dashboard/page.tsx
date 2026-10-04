"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUserProfile } from "@/lib/auth";

export default function DashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState<{
    email?: string;
  } | null>(null);
  const [profile, setProfile] = useState<{
    full_name: string | null;
    role: string | null;
  } | null>(null);
  const [college, setCollege] = useState<{
    name: string;
    code: string | null;
  } | null>(null);

  useEffect(() => {
    async function loadDashboard() {
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

      setUser(result.user);
      setProfile(result.profile);
      setCollege(result.college);
      setLoading(false);
    }

    loadDashboard();
  }, [router]);

  if (loading) {
    return <main>Loading dashboard...</main>;
  }

  if (error) {
    return <main>Unable to load dashboard: {error}</main>;
  }

  return (
    <main>
      <h1>CampusFlow Dashboard</h1>

      <p>Welcome, {profile?.full_name}</p>

      <h2>Your Identity</h2>

      <p>Email: {user?.email}</p>
      <p>Role: {profile?.role}</p>
      <p>College: {college?.name}</p>
      <p>College Code: {college?.code}</p>
    </main>
  );
}
