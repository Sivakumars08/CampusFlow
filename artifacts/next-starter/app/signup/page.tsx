"use client";

import { useState } from "react";
import type { FormEvent } from "react";

import { signUp } from "@/lib/auth";

const DEMO_COLLEGE_ID = "99ec32f7-8d09-4dee-ae76-c787e88c5a38";
const MIN_PASSWORD_LENGTH = 6;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type SignupMessage = {
  kind: "error" | "success";
  text: string;
};

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<SignupMessage | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    setMessage(null);

    const normalizedFullName = fullName.trim();
    const normalizedEmail = email.trim();

    if (!normalizedFullName) {
      setMessage({ kind: "error", text: "Enter your full name." });
      return;
    }

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setMessage({ kind: "error", text: "Enter a valid email address." });
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setMessage({
        kind: "error",
        text: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await signUp(
        normalizedEmail,
        password,
        normalizedFullName,
        DEMO_COLLEGE_ID
      );

      if (error) {
        setMessage({ kind: "error", text: `Signup failed: ${error.message}` });
      } else if (data.user) {
        setMessage({
          kind: "success",
          text: "Signup succeeded. Check your email and confirm your account.",
        });
      } else {
        setMessage({
          kind: "error",
          text: "Supabase returned no user, so signup could not be confirmed.",
        });
      }
    } catch (error) {
      setMessage({
        kind: "error",
        text:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred during signup.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <h1>CampusFlow Signup</h1>

      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="full-name">Full Name</label>
        <input
          id="full-name"
          name="fullName"
          autoComplete="name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          required
        />

        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={MIN_PASSWORD_LENGTH}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          aria-describedby="password-help"
        />
        <p id="password-help">
          Use at least {MIN_PASSWORD_LENGTH} characters.
        </p>

        <p>College: CampusFlow Demo College</p>

        <button type="submit" disabled={loading}>
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </form>

      {message && (
        <p role={message.kind === "error" ? "alert" : "status"}>{message.text}</p>
      )}
    </main>
  );
}
