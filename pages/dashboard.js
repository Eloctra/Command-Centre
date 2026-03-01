import { useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/library/firebaseConfig";
import { useRouter } from "next/router";

export default function Dashboard() {
  const [userEmail, setUserEmail] = useState("");
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) router.push("/auth/login");
      else setUserEmail(user.email || "");
    });
    return () => unsub();
  }, [router]);

  async function logout() {
    await signOut(auth);
    router.push("/auth/login");
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Logged in as: {userEmail}</p>
      <button onClick={logout}>Sign out</button>
      <Link href="/courses">Courses</Link> |{" "}
    </div>
  );
}