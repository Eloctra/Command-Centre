// Dashboard page that has calendar, weather, and today's coursework/project tasks.
import { useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  onSnapshot,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { auth, database } from "@/library/firebaseConfig";
import { useRouter } from "next/router";
import { useSession, signIn } from "next-auth/react";

export default function Dashboard() {
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState(null);

  const { data: session, status: sessionStatus } = useSession();

  const [weather, setWeather] = useState({
    loading: true,
    error: "",
    data: null,
  });

  const [calendar, setCalendar] = useState({
    loading: true,
    error: "",
    events: [],
  });

  const [todayCourseWork, setTodayCourseWork] = useState([]);
  const [todayProjectWork, setTodayProjectWork] = useState([]);

  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/auth/login");
      } else {
        setUserEmail(user.email || "");
        setUserId(user.uid);
      }
    });
    return () => unsub();
  }, [router]);

  useEffect(() => {
    async function loadWeather() {
      try {
        const r = await fetch("/api/weather?city=State College");
        const data = await r.json();
        if (!r.ok) {
          throw new Error(data?.message || "Weather request failed");
        }
        setWeather({ loading: false, error: "", data });
      } catch (e) {
        setWeather({ loading: false, error: e.message, data: null });
      }
    }
    loadWeather();
  }, []);

  useEffect(() => {
    async function loadCalendar() {
      try {
        const r = await fetch("/api/calendar/today");
        const data = await r.json();
        if (!r.ok) {
          throw new Error(data?.message || "Calendar request failed");
        }
        setCalendar({
          loading: false,
          error: "",
          events: data.events || [],
        });
      } catch (e) {
        setCalendar({ loading: false, error: e.message, events: [] });
      }
    }
    loadCalendar();
  }, []);

  function getTodayKey() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  useEffect(() => {
    if (!userId) return;

    const todayKey = getTodayKey();
    const coursesRef = collection(database, "users", userId, "courses");
    const unsubCourses = onSnapshot(coursesRef, async (snap) => {
      const all = [];

      for (const courseDoc of snap.docs) {
        const courseId = courseDoc.id;
        const courseName = courseDoc.data().name;

        const asnRef = collection(
          database,
          "users",
          userId,
          "courses",
          courseId,
          "assignments"
        );
        const qAssignments = query(
          asnRef,
          where("dueDate", "==", todayKey)
        );
        const asnSnap = await getDocs(qAssignments);

        asnSnap.forEach((d) => {
          all.push({
            id: d.id,
            courseId,
            courseName,
            ...d.data(),
          });
        });
      }

      all.sort((a, b) => (a.priority || 0) - (b.priority || 0));
      setTodayCourseWork(all);
    });

    return () => unsubCourses();
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    const todayKey = getTodayKey();
    const projectsRef = collection(database, "users", userId, "projects");
    const unsubProjects = onSnapshot(projectsRef, async (snap) => {
      const all = [];

      for (const projectDoc of snap.docs) {
        const projectId = projectDoc.id;
        const projectName = projectDoc.data().name;

        const tasksRef = collection(
          database,
          "users",
          userId,
          "projects",
          projectId,
          "tasks"
        );
        const qTasks = query(tasksRef, where("dueDate", "==", todayKey));
        const tasksSnap = await getDocs(qTasks);

        tasksSnap.forEach((d) => {
          all.push({
            id: d.id,
            projectId,
            projectName,
            ...d.data(),
          });
        });
      }

      all.sort((a, b) => (a.priority || 0) - (b.priority || 0));
      setTodayProjectWork(all);
    });

    return () => unsubProjects();
  }, [userId]);

  async function logout() {
    await signOut(auth);
    router.push("/auth/login");
  }

  if (!userId) {
    return (
      <div style={{ padding: 24 }}>
        <p>Checking authentication...</p>
      </div>
    );
  }

  const todayStr = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const hasGoogleSession = !!session;

  return (
    <div
      style={{
        padding: 24,
        maxWidth: 960,
        margin: "0 auto",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <div>
          <h1 style={{ marginBottom: 4 }}>Dashboard</h1>
          <p style={{ margin: 0, opacity: 0.8 }}>
            {todayStr} · Logged in as {userEmail}
          </p>
        </div>
        <button
          onClick={logout}
          style={{
            padding: "8px 14px",
            borderRadius: 999,
            border: "1px solid var(--cc-border-subtle)",
            background: "rgba(15,23,42,0.9)",
            color: "var(--cc-text)",
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          Sign out
        </button>
      </header>

      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <Link
          href="/dashboard"
          style={{
            padding: "8px 16px",
            borderRadius: 999,
            border: "1px solid var(--cc-border-subtle)",
            background: "rgba(15,23,42,0.9)",
            color: "var(--cc-text)",
            fontSize: 13,
          }}
        >
          Dashboard
        </Link>
        <Link
          href="/courses"
          style={{
            padding: "8px 16px",
            borderRadius: 999,
            border: "1px solid var(--cc-border-subtle)",
            background: "rgba(15,23,42,0.9)",
            color: "var(--cc-text)",
            fontSize: 13,
          }}
        >
          Courses
        </Link>
        <Link
          href="/dev"
          style={{
            padding: "8px 16px",
            borderRadius: 999,
            border: "1px solid var(--cc-border-subtle)",
            background: "rgba(15,23,42,0.9)",
            color: "var(--cc-text)",
            fontSize: 13,
          }}
        >
          Developers
        </Link>
      </div>
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 24,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            padding: 16,
            borderRadius: 16,
            background: "var(--cc-surface)",
            color: "var(--cc-text)",
            border: "1px solid var(--cc-border-subtle)",
            boxShadow: "0 24px 80px rgba(0,0,0,0.55)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <h2 style={{ margin: 0 }}>Today&apos;s Calendar</h2>
            {hasGoogleSession ? (
              <span
                style={{
                  fontSize: 12,
                  padding: "3px 9px",
                  borderRadius: 999,
                  background: "rgba(250,204,21,0.16)",
                  border: "1px solid rgba(250,204,21,0.45)",
                  color: "var(--cc-accent-soft)",
                }}
              >
                Google linked
              </span>
            ) : (
              <span
                style={{
                  fontSize: 12,
                  opacity: 0.75,
                }}
              >
                Connect Google to see events
              </span>
            )}
          </div>

          {calendar.loading ? (
            <p>Loading events...</p>
          ) : calendar.error ? (
            <p style={{ color: "#f87171" }}>{calendar.error}</p>
          ) : calendar.events.length === 0 ? (
            <p>No events today.</p>
          ) : (
            <ul style={{ paddingLeft: 18 }}>
              {calendar.events.map((ev) => (
                <li key={ev.id} style={{ marginBottom: 6 }}>
                  <strong>{ev.title}</strong>
                  {ev.start && (
                    <span style={{ opacity: 0.75 }}>
                      {" "}
                      –{" "}
                      {new Date(ev.start).toLocaleTimeString(undefined, {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}

          {!hasGoogleSession && sessionStatus !== "loading" && (
            <div style={{ marginTop: 12 }}>
              <button
                onClick={() => signIn("google")}
                style={{
                  padding: "8px 14px",
                  borderRadius: 999,
                  border: "1px solid var(--cc-border-subtle)",
                  background:
                    "linear-gradient(90deg, var(--cc-accent), var(--cc-accent-soft))",
                  color: "#020617",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                Sign in with Google
              </button>
            </div>
          )}
        </div>

        <div
          style={{
            padding: 16,
            borderRadius: 16,
            background: "var(--cc-surface-alt)",
            color: "var(--cc-text)",
            border: "1px solid var(--cc-border-subtle)",
            boxShadow: "0 24px 80px rgba(0,0,0,0.55)",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Weather · State College</h2>
          {weather.loading ? (
            <p>Loading weather...</p>
          ) : weather.error ? (
            <p style={{ color: "#f87171" }}>{weather.error}</p>
          ) : weather.data ? (
            <div>
              <p style={{ fontSize: 32, margin: "4px 0" }}>
                {weather.data.temp}°F
              </p>
              <p style={{ margin: "4px 0" }}>
                {weather.data.city} · {weather.data.description}
              </p>
            </div>
          ) : (
            <p>Weather unavailable.</p>
          )}
        </div>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
        }}
      >
        <div
          style={{
            padding: 16,
            borderRadius: 16,
            background: "var(--cc-surface-alt)",
            color: "var(--cc-text)",
            border: "1px solid var(--cc-border-subtle)",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Courses · Due Today</h2>
          {todayCourseWork.length === 0 ? (
            <p>No course work due today.</p>
          ) : (
            <ul style={{ paddingLeft: 18 }}>
              {todayCourseWork.map((a) => (
                <li key={a.id} style={{ marginBottom: 6 }}>
                  <strong>{a.title}</strong> · {a.courseName} · due{" "}
                  {a.dueDate} · p{a.priority}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div
          style={{
            padding: 16,
            borderRadius: 16,
            background: "var(--cc-surface-alt)",
            color: "var(--cc-text)",
            border: "1px solid var(--cc-border-subtle)",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Projects · Due Today</h2>
          {todayProjectWork.length === 0 ? (
            <p>No project work due today.</p>
          ) : (
            <ul style={{ paddingLeft: 18 }}>
              {todayProjectWork.map((t) => (
                <li key={t.id} style={{ marginBottom: 6 }}>
                  <strong>{t.title}</strong> · {t.projectName} · due{" "}
                  {t.dueDate} · p{t.priority}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}