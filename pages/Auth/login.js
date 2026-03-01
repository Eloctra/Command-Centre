import { useState } from "react";
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
    <div style={{ maxWidth: 360 }}>
      <h1>Login</h1>

      <form onSubmit={handleEmailLogin} style={{ display: "grid", gap: 10 }}>
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
        <button type="submit">Sign in</button>
      </form>

      <div style={{ marginTop: 12 }}>
        <button onClick={handleGoogleLogin}>Sign in with Google</button>
      </div>

      {msg && <p style={{ color: "lightgreen" }}>{msg}</p>}
      {err && <p style={{ color: "salmon" }}>{err}</p>}
    </div>
  );
}