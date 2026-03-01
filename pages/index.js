import Link from "next/link";

export default function Home() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Command Centre</h1>
      <p>Your college + developer dashboard.</p>

      <p>
      <Link href="/auth/signup">Sign Up</Link> |<Link href="/auth/login">Login</Link>  
      </p>

      <p>
        <Link href="/dashboard">Dashboard</Link> |{" "}
        <Link href="/courses">Courses</Link> |{" "}
        <Link href="/projects">Projects</Link> |{" "}
        <Link href="/settings">Settings</Link>
      </p>
    </div>
  );
}