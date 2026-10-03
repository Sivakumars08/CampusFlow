"use client";

import { useState } from "react";
import type { FormEvent } from "react";

import { signIn } from "@/lib/auth";

type LoginMessage = {
  kind: "error" | "success";
  text: string;
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<LoginMessage | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    setMessage(null);

    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setMessage({ kind: "error", text: "Enter your email." });
      return;
    }

    if (!password) {
      setMessage({ kind: "error", text: "Enter your password." });
      return;
    }

    setLoading(true);

    try {
      const { error } = await signIn(normalizedEmail, password);

      if (error) {
        setMessage({ kind: "error", text: error.message });
      } else {
        setMessage({ kind: "success", text: "Login successful." });
      }
    } catch (error) {
      setMessage({
        kind: "error",
        text:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred during login.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <h1>CampusFlow Login</h1>

      <form onSubmit={handleSubmit} noValidate>
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
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>

      {message && (
        <p role={message.kind === "error" ? "alert" : "status"}>{message.text}</p>
      )}
    </main>
  );
}