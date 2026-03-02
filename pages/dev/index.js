// Developer projects page for tracking projects and their associated tasks.
import { useMemo, useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, database } from "@/library/firebaseConfig";

import {
  Page,
  Card,
  Row,
  Input,
  Button,
  Select,
  Muted,
  ErrorText,
  Accordion,
  CourseHeader as ProjectHeader,
  CourseBody as ProjectBody,
  AssignmentList as TaskList,
  AssignmentRow as TaskRow,
  Tooltip,
  Small,
  Pill,
} from "../courses";

export default function Developers() {
    const [user, setUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);

    const [projectName, setProjectName] = useState("");
    const [projects, setProjects] = useState([]);
    const [openProject, setOpenProject] = useState(null);
    const projectInitializedRef = useRef(false);

    const [tasksByProject, setTasksByProject] = useState({});
    const [taskTitle, setTaskTitle] = useState("");
    const [taskDueDate, setTaskDueDate] = useState("");
    const [taskPriority, setTaskPriority] = useState(3);
  const [taskNotes, setTaskNotes] = useState("");

  const [err, setErr] = useState("");

  useEffect(() => {
    const current = auth.currentUser;
    if (current) {
      setUser(current);
      setLoadingUser(false);
    }

    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u ?? null);
      setLoadingUser(false);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;

    const qProjects = query(
      collection(database, "users", user.uid, "projects"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(
      qProjects,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setProjects(list);
        setOpenProject((prev) => {
          if (list.length === 0) {
            projectInitializedRef.current = false;
            return null;
          }
          const stillExists = prev && list.some((p) => p.id === prev);
          if (stillExists) return prev;
          if (!prev && projectInitializedRef.current) return null;
          projectInitializedRef.current = true;
          return list[0].id;
        });
      },
      (e) => setErr(e.message)
    );

    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    if (!openProject) return;

    const qTasks = query(
      collection(
        database,
        "users",
        user.uid,
        "projects",
        openProject,
        "tasks"
      ),
      orderBy("dueDate", "asc")
    );

    const unsub = onSnapshot(
      qTasks,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setTasksByProject((prev) => ({ ...prev, [openProject]: list }));
      },
      (e) => setErr(e.message)
    );

    return () => unsub();
  }, [user, openProject]);

  const openTasks = useMemo(() => {
    if (!openProject) return [];
    return tasksByProject[openProject] || [];
  }, [tasksByProject, openProject]);

  async function addProject(e) {
    e.preventDefault();
    setErr("");

    if (!projectName.trim()) return;

    try {
      const ref = await addDoc(
        collection(database, "users", user.uid, "projects"),
        {
          name: projectName.trim(),
          createdAt: Date.now(),
        }
      );
      setProjectName("");
      setOpenProject(ref.id);

      setTaskTitle("");
      setTaskDueDate("");
      setTaskPriority(3);
      setTaskNotes("");
    } catch (e) {
      setErr(e.message);
    }
  }

  async function addTask(e, projectId) {
    e.preventDefault();
    setErr("");

    const title = taskTitle.trim();
    if (!title) return;
    if (!taskDueDate) return;

    try {
      await addDoc(
        collection(
          database,
          "users",
          user.uid,
          "projects",
          projectId,
          "tasks"
        ),
        {
          title,
          dueDate: taskDueDate,
          priority: Number(taskPriority),
          status: "todo",
          notes: taskNotes.trim(),
          createdAt: Date.now(),
        }
      );

      setTaskTitle("");
      setTaskDueDate("");
      setTaskPriority(3);
      setTaskNotes("");
    } catch (e) {
      setErr(e.message);
    }
  }

  async function toggleTask(projectId, taskId, currentStatus) {
    setErr("");
    try {
      await updateDoc(
        doc(
          database,
          "users",
          user.uid,
          "projects",
          projectId,
          "tasks",
          taskId
        ),
        { status: currentStatus === "done" ? "todo" : "done" }
      );
    } catch (e) {
      setErr(e.message);
    }
  }

  if (loadingUser) return <p style={{ padding: 24 }}>Verifying User</p>;

  if (!user) {
    return (
      <div style={{ padding: 24 }}>
        <p>Login to view Developer Projects</p>
        <Link href="/auth/login">Login here</Link>
      </div>
    );
  }

  return (
    <Page>
      <h1>Developer Projects</h1>
      <div
        style={{
          display: "flex",
          gap: "0.8rem",
          margin: "0.75rem 0 1.2rem",
        }}
      >
        <Link
          href="/dashboard"
          style={{
            padding: "0.6rem 1.1rem",
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
            padding: "0.6rem 1.1rem",
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
            padding: "0.6rem 1.1rem",
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
      <Muted>
        Track your dev projects and break them into tasks with priorities and
        due dates.
      </Muted>

      <Card>
        <form onSubmit={addProject}>
          <Row>
            <Input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Project name (eg: Command Centre)"
            />
            <Button type="submit">Add project</Button>
          </Row>
        </form>

        {err && <ErrorText>{err}</ErrorText>}

        <Accordion>
          {projects.length === 0 ? (
            <Muted>No projects yet.</Muted>
          ) : (
            projects.map((project) => {
              const isOpen = openProject === project.id;

              return (
                <div key={project.id}>
                  <ProjectHeader
                    onClick={() => {
                      setOpenProject((prev) =>
                        prev === project.id ? null : project.id
                      );
                      setTaskTitle("");
                      setTaskDueDate("");
                      setTaskPriority(3);
                      setTaskNotes("");
                    }}
                  >
                    <span>{project.name}</span>
                    <span style={{ opacity: 0.8 }}>
                      {isOpen ? "▾" : "▸"}
                    </span>
                  </ProjectHeader>

                  {isOpen && (
                    <ProjectBody>
                      <h2 style={{ margin: 0 }}>Tasks</h2>

                      <form
                        onSubmit={(e) => addTask(e, project.id)}
                        style={{ marginTop: 10 }}
                      >
                        <div
                          style={{
                            display: "grid",
                            gap: 10,
                            maxWidth: 720,
                            gridTemplateColumns: "1fr auto",
                          }}
                        >
                          <Row style={{ gridColumn: "1 / -1" }}>
                            <Input
                              value={taskTitle}
                              onChange={(e) =>
                                setTaskTitle(e.target.value)
                              }
                              placeholder="Task title (e.g., Hook up Firebase auth)"
                            />
                          </Row>

                          <Row style={{ gridColumn: "1 / 2" }}>
                            <Input
                              type="date"
                              value={taskDueDate}
                              onChange={(e) =>
                                setTaskDueDate(e.target.value)
                              }
                            />
                            <Button type="submit">Add task</Button>
                          </Row>

                          <Select
                            value={taskPriority}
                            onChange={(e) =>
                              setTaskPriority(Number(e.target.value))
                            }
                            aria-label="Task priority"
                            style={{
                              gridColumn: "2 / 3",
                              gridRow: "2 / span 2",
                              alignSelf: "end",
                              minWidth: 160,
                            }}
                          >
                            <option value={1}>Priority 1</option>
                            <option value={2}>Priority 2</option>
                            <option value={3}>Priority 3</option>
                            <option value={4}>Priority 4</option>
                            <option value={5}>Priority 5</option>
                          </Select>

                          <Input
                            value={taskNotes}
                            onChange={(e) => setTaskNotes(e.target.value)}
                            placeholder="Notes (optional) – shown in hover tooltip"
                            style={{ gridColumn: "1 / 2" }}
                          />
                        </div>
                      </form>

                      <TaskList>
                        {openTasks.length === 0 ? (
                          <Muted style={{ marginTop: 10 }}>
                            No tasks yet.
                          </Muted>
                        ) : (
                          openTasks.map((t) => (
                            <TaskRow key={t.id}>
                              <div
                                style={{
                                  display: "flex",
                                  gap: 10,
                                  alignItems: "center",
                                }}
                              >
                                <b
                                  style={{
                                    textDecoration:
                                      t.status === "done"
                                        ? "line-through"
                                        : "none",
                                  }}
                                >
                                  {t.title}
                                </b>
                                <Pill>
                                  {t.status === "done" ? "done" : "todo"}
                                </Pill>
                                <Pill>p{t.priority}</Pill>
                              </div>

                              <div
                                style={{
                                  display: "flex",
                                  gap: 8,
                                  alignItems: "center",
                                }}
                              >
                                <span style={{ opacity: 0.85 }}>
                                  due {t.dueDate}
                                </span>
                                <Button
                                  type="button"
                                  onClick={() =>
                                    toggleTask(
                                      project.id,
                                      t.id,
                                      t.status
                                    )
                                  }
                                  style={{
                                    flexShrink: 0,
                                    padding: "0.5rem 0.9rem",
                                    fontSize: 13,
                                  }}
                                >
                                  {t.status === "done"
                                    ? "Mark todo"
                                    : "Mark done"}
                                </Button>
                              </div>

                              <Tooltip className="tooltip">
                                <Small>
                                  <div>
                                    <b>{t.title}</b>
                                  </div>
                                  <div>
                                    Due: <b>{t.dueDate}</b>
                                  </div>
                                  <div>
                                    Priority: <b>{t.priority}</b>
                                  </div>
                                  <div>
                                    Status: <b>{t.status}</b>
                                  </div>
                                  {t.notes ? (
                                    <div>
                                      Notes: <b>{t.notes}</b>
                                    </div>
                                  ) : (
                                    <div style={{ opacity: 0.7 }}>
                                      Notes: (none)
                                    </div>
                                  )}
                                </Small>
                              </Tooltip>
                            </TaskRow>
                          ))
                        )}
                      </TaskList>
                    </ProjectBody>
                  )}
                </div>
              );
            })
          )}
        </Accordion>
      </Card>
    </Page>
  );
}
