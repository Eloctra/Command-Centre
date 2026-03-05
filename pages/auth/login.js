import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/library/firebaseConfig";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const router = useRouter();

  async function handleEmailLogin(e) {
    e.preventDefault();
    setMsg("");
    setErr("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      setMsg(`User ${user.email} logged in successfully`);
      router.push("/dashboard");
    } catch (error) {
      setErr(`Error ${error.code}: ${error.message}`);
    }
  }

  async function handleGoogleLogin() {
    setMsg("");
    setErr("");

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      setMsg(`User ${user.email} logged in with Google`);
      router.push("/dashboard");
    } catch (error) {
      setErr(`Error ${error.code}: ${error.message}`);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(circle at top, rgba(56,189,248,0.18), transparent 55%)",
        padding: "2rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "var(--cc-surface)",
          borderRadius: "1.2rem",
          border: "1px solid var(--cc-border-subtle)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
          padding: "1.8rem 2rem 2.1rem",
          color: "var(--cc-text)",
        }}
      >
        <h1 style={{ margin: 0, marginBottom: "0.5rem", fontSize: "1.6rem" }}>
          Login
        </h1>
        <p style={{ margin: 0, marginBottom: "1.5rem", opacity: 0.8, fontSize: 14 }}>
          Welcome back. Sign in to access your dashboard.
        </p>

        <form
          onSubmit={handleEmailLogin}
          style={{ display: "grid", gap: 12, marginBottom: "1.2rem" }}
        >
          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              padding: "0.8rem 0.9rem",
              borderRadius: "0.9rem",
              border: "1px solid var(--cc-border-subtle)",
              background: "#020617",
              color: "var(--cc-text)",
              outline: "none",
            }}
          />
          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              padding: "0.8rem 0.9rem",
              borderRadius: "0.9rem",
              border: "1px solid var(--cc-border-subtle)",
              background: "#020617",
              color: "var(--cc-text)",
              outline: "none",
            }}
          />
          <button
            type="submit"
            style={{
              marginTop: "0.4rem",
              padding: "0.8rem 0.9rem",
              borderRadius: "0.9rem",
              border: "1px solid var(--cc-border-subtle)",
              background:
                "linear-gradient(120deg, var(--cc-accent), var(--cc-accent-soft))",
              color: "#020617",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            Sign in
          </button>
        </form>

        <button
          onClick={handleGoogleLogin}
          style={{
            width: "100%",
            padding: "0.75rem 0.9rem",
            borderRadius: "999px",
            border: "1px solid var(--cc-border-subtle)",
            background: "rgba(15,23,42,0.9)",
            color: "var(--cc-text)",
            cursor: "pointer",
            fontSize: 14,
            marginBottom: "0.9rem",
          }}
        >
          Sign in with Google
        </button>

        <div style={{ fontSize: 13, marginBottom: "0.4rem" }}>
          <span style={{ opacity: 0.8 }}>Don&apos;t have an account? </span>
          <Link href="/auth/signup" style={{ color: "var(--cc-accent-soft)" }}>
            Sign up
          </Link>
        </div>

        {msg && <p style={{ color: "lightgreen", fontSize: 13 }}>{msg}</p>}
        {err && <p style={{ color: "salmon", fontSize: 13 }}>{err}</p>}
      </div>
    </div>
  );
}