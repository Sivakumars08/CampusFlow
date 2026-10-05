"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUserProfile } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

const categories = [
  { value: "academic", label: "Academic" },
  { value: "hostel", label: "Hostel" },
  { value: "infrastructure", label: "Infrastructure" },
  { value: "laboratory", label: "Laboratory" },
  { value: "library", label: "Library" },
  { value: "transport", label: "Transport" },
  { value: "mess", label: "Mess" },
  { value: "technology", label: "Technology" },
  { value: "other", label: "Other" },
];

export default function NewRequestPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("academic");
  const [location, setLocation] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const trimmedLocation = location.trim();

    if (!trimmedTitle) {
      setError("Please enter a title.");
      return;
    }

    if (!trimmedDescription) {
      setError("Please enter a description.");
      return;
    }

    if (!categories.some((item) => item.value === category)) {
      setError("Please select a valid category.");
      return;
    }

    setSubmitting(true);

    const result = await getCurrentUserProfile();

    if (!result.user) {
      router.replace("/login");
      return;
    }

    if (result.error || !result.profile || !result.college) {
      setError(
        result.error?.message ||
          "Unable to load your CampusFlow profile."
      );
      setSubmitting(false);
      return;
    }

    const { error: insertError } = await supabase
      .from("requests")
      .insert({
        requester_id: result.user.id,
        college_id: result.profile.college_id,
        title: trimmedTitle,
        description: trimmedDescription,
        category,
        location: trimmedLocation || null,
        priority: "medium",
      });

    if (insertError) {
      setError(insertError.message);
      setSubmitting(false);
      return;
    }

    router.push("/my-requests");
  }

  return (
    <main>
      <h1>Submit a Request</h1>

      <p>
        Submit a campus request and track its progress through CampusFlow.
      </p>

      {error && (
        <p role="alert">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Title</label>
          <br />
          <input
            id="title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Hostel water supply issue"
            disabled={submitting}
            required
          />
        </div>

        <br />

        <div>
          <label htmlFor="description">Description</label>
          <br />
          <textarea
            id="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Describe the issue clearly..."
            rows={6}
            disabled={submitting}
            required
          />
        </div>

        <br />

        <div>
          <label htmlFor="category">Category</label>
          <br />
          <select
            id="category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            disabled={submitting}
          >
            {categories.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <br />

        <div>
          <label htmlFor="location">Location (optional)</label>
          <br />
          <input
            id="location"
            type="text"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="e.g. Hostel Block A"
            disabled={submitting}
          />
        </div>

        <br />

        <br />

        <button type="submit" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Request"}
        </button>
      </form>
    </main>
  );
}
