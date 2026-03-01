import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/library/firebaseConfig";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const router = useRouter();

  async function handleSignup(e) {
    e.preventDefault();
    setMsg("");
    setErr("");

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      setMsg(`User ${user.email} signed up successfully`);
      router.push("/dashboard");
    } catch (error) {
      setErr(`Error ${error.code}: ${error.message}`);
    }
  }

  return (
    <div style={{ maxWidth: 360 }}>
      <h1>Sign Up</h1>

      <form onSubmit={handleSignup} style={{ display: "grid", gap: 10 }}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Create account</button>
      </form>
      <div>
        <Link href="/auth/login">Login</Link>
      </div>

      {msg && <p style={{ color: "lightgreen" }}>{msg}</p>}
      {err && <p style={{ color: "salmon" }}>{err}</p>}
    </div>
  );
}