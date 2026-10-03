"use client";

import { FormEvent, useState } from "react";

import { signUp } from "@/lib/auth";

const DEMO_COLLEGE_ID = "99ec32f7-8d09-4dee-ae76-c787e88c5a38";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Button clicked. Testing form...");
    setLoading(true);
    setMessage("");

    const { data, error } = await signUp(
      email,
      password,
      fullName,
      DEMO_COLLEGE_ID
    );

    if (error) {
      setMessage(`Signup failed: ${error.message}`);
    } else if (data.user) {
      setMessage(
        "Signup successful. Please check your email to confirm your account."
      );
    } else {
      setMessage(
        "Signup request completed, but Supabase did not return a user."
      );
    }

    setLoading(false);
  }

  return (
    <main>
      <h1>CampusFlow Signup</h1>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Full Name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        <p>College: CampusFlow Demo College</p>

        <button type="button" onClick={() => setMessage("Button is working")} disabled={loading}>
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </form>

      {message && <p>{message}</p>}
    </main>
  );
}
