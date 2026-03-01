// Landing page that introduces the app and links to authentication flows.
import Link from "next/link";

export default function Home() {
  return (
    <div
      style={{
        padding: 32,
        maxWidth: 960,
        margin: "0 auto",
      }}
    >
      <h1 style={{ marginBottom: 8 }}>Command Centre</h1>
      <div style={{ marginTop: 16 }}>
        <p style={{ marginBottom: 8 }}>
          <Link href="/auth/signup">Sign Up</Link> {" · "}
          <Link href="/auth/login">Login</Link>
        </p>
      </div>
    </div>
  );
}