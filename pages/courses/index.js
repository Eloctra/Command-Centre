// Courses page for creating courses and managing assignments in an accordion layout.
import { useMemo, useEffect,useState }  from "react";
import Link from "next/link";
import { addDoc,collection,doc,onSnapshot,orderBy,query,updateDoc} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import {auth, database} from "@/library/firebaseConfig";
import styled from "styled-components";

export const Page = styled.div`
  padding: 2.2vw;
  max-width: 72vw;
  margin: 0 auto;
  color: var(--cc-text);
`;

export const Card = styled.div`
  background: var(--cc-surface);
  border: 0.12vw solid var(--cc-border-subtle);
  border-radius: 1.2vw;
  padding: 1.6vw;
  box-shadow: 0 2vw 5vw rgba(0, 0, 0, 0.5);
`;

export const Row = styled.div`
  display: flex;
  gap: 1vw;
  align-items: center;
`;

export const Input = styled.input`
  flex: 1;
  padding: 1vw 1.1vw;
  border-radius: 0.9vw;
  border: 0.12vw solid var(--cc-border-subtle);
  background: #020617;
  color: var(--cc-text);
  outline: none;
  &::placeholder {
    color: #a7b0c5;
  }
  &:focus {
    border-color: var(--cc-accent-soft);
  }
`;

export const Select = styled.select`
  padding: 1vw 1.1vw;
  border-radius: 0.9vw;
  border: 0.12vw solid var(--cc-border-subtle);
  background: #020617;
  color: var(--cc-text);
  outline: none;

  &:focus {
    border-color: var(--cc-accent-soft);
  }
`;

export const Button = styled.button`
  padding: 1vw 1.1vw;
  border-radius: 0.9vw;
  border: 0.12vw solid var(--cc-border-subtle);
  background: linear-gradient(
    120deg,
    var(--cc-accent),
    var(--cc-accent-soft)
  );
  color: #020617;
  cursor: pointer;

  &:hover {
    filter: brightness(1.03);
  }
`;

export const Muted = styled.p`
  color: var(--cc-text-muted);
`;

export const ErrorText = styled.p`
  color: #ff6b6b;
`;

export const Accordion = styled.div`
  display: grid;
  gap: 1vw;
  margin-top: 1.2vw;
`;

export const CourseHeader = styled.button`
  width: 100%;
  text-align: left;
  padding: 1.1vw 1.1vw;
  border-radius: 1vw;
  border: 0.12vw solid var(--cc-border-subtle);
  background: #020617;
  color: var(--cc-text);
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:hover {
    background: #020617;
    box-shadow: 0 0.6vw 2vw rgba(0, 0, 0, 0.7);
  }
`;

export const CourseBody = styled.div`
  padding: 1.1vw;
  border: 0.12vw solid var(--cc-border-subtle);
  border-top: 0vw;
  border-radius: 0vw 0vw 1vw 1vw;
  background: var(--cc-surface-alt);
`;

export const AssignmentList = styled.div`
  display: grid;
  gap: 0.8vw;
  margin-top: 1vw;
`;

export const AssignmentRow = styled.div`
  position: relative;
  padding: 1vw 1vw;
  border-radius: 0.9vw;
  border: 0.12vw solid var(--cc-border-subtle);
  background: #020617;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:hover .tooltip {
    opacity: 1;
    transform: translateY(0vh);
    pointer-events: auto;
  }
`;

export const Tooltip = styled.div`
  position: absolute;
  left: 1vw;
  top: calc(100% + 1vh);
  width: 40vw;
  max-width: 90vw;
  padding: 1vw 1.1vw;
  border-radius: 1vw;
  border: 0.12vw solid var(--cc-border-subtle);
  background: #020617;
  box-shadow: 0vw 1.2vw 3vw #00000066;
  opacity: 0;
  transform: translateY(-0.6vh);
  transition: 0.12s ease;
  pointer-events: none;
  z-index: 50;
`;

export const Small = styled.div`
  font-size: 0.9vw;
  color: var(--cc-text);
  display: grid;
  gap: 0.4vw;
`;

export const Pill = styled.span`
  padding: 0.35vw 0.7vw;
  border-radius: 50vw;
  border: 0.12vw solid var(--cc-border-subtle);
  font-size: 0.85vw;
  color: var(--cc-text);
  background: rgba(15, 23, 42, 0.95);
`;

export default function Courses(){
    const [user,setUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);
    
    const [courseName, setCourseName] = useState("");
    const [courses, setCourses] = useState([]);
    const [openCourse, setOpenCourse]=useState(null);

    const [assignmentsByCourse, setAssignmentsByCourse]= useState({});
    const [asnTitle, setAsnTitle] = useState("");
    const [asnDueDate, setAsnDueDate] = useState("");
    const [asnPriority, setAsnPriority] = useState(3);
    const [asnNotes, setAsnNotes] = useState("");   

    const [err,setErr] = useState("");

    useEffect(()=>{
        const current = auth.currentUser;
        if(current){
            setUser(current);
            setLoadingUser(false);
        }
        
        const unsub = onAuthStateChanged(auth, (u)=>{
            setUser(u ?? null);
            setLoadingUser(false);
        });
        return()=> unsub();
    },[]);

    useEffect(()=> {
        if (!user) return;
        
        const q=query(
            collection(database,"users",user.uid,"courses"),
            orderBy("createdAt","desc")
        );

        const unsub = onSnapshot(
            q, (snap)=> {
                const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
                setCourses(list)
                
                if(!openCourse && list.length>0) setOpenCourse(list[0].id);
            },
            (e)=> setErr(e.message)  
        );

        return()=>unsub();
    },[user]);

    useEffect(()=>{
        if(!user)return;
        if(!openCourse)return;
        
        const q=query(
            collection(database,"users",user.uid,"courses",openCourse,"assignments"),
            orderBy("dueDate","asc")
        );
        const unsub=onSnapshot(
            q,(snap)=>{
                const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
                setAssignmentsByCourse((prev)=> ({...prev,[openCourse]:list}));
            },
            (e)=> setErr(e.message)
        );
        return()=>unsub();
    },[user,openCourse]);

    const openAssignments=useMemo(()=>{
        if(!openCourse)return[];
        return assignmentsByCourse[openCourse]||[];
    },[assignmentsByCourse,openCourse]);

    async function addCourse(e){
        e.preventDefault();
        setErr("")

        if(!courseName.trim()) return;
        
        try{
            const ref = await addDoc(collection(database,"users",user.uid,"courses"),{
                name: courseName.trim(),
                createdAt: Date.now()
            });
            setCourseName("");
            setOpenCourse(ref.id)

            setAsnTitle("");
            setAsnDueDate("");
            setAsnPriority(3);
            setAsnNotes("");
        }catch(e){
            setErr(e.message);
        }
    }

    async function addAssignment(e,courseId){
        e.preventDefault();
        setErr("");
        const title=asnTitle.trim();
        if(!title) return;
        if(!asnDueDate) return;

        try{
            await addDoc(collection(database,"users",user.uid,"courses",courseId,"assignments"),
        {
            title,
            dueDate:asnDueDate,
            priority:Number(asnPriority),
            status:"todo",
            notes:asnNotes.trim(),
            createdAt: Date.now(),
        }
        );

        setAsnTitle("")
        setAsnDueDate("")
        setAsnPriority(3)
        setAsnNotes("")

        }catch(e){
            setErr(e.message);
        }
    }

    async function toggleAsn(courseId, assignmentId, currentStatus){
        setErr("");
        try{
            await updateDoc(
                doc(database,"users",user.uid,"courses",courseId,"assignments",assignmentId),
                {status: currentStatus==="done"?"todo":"done"}
            );
        }catch(e){
            setErr(e.message);
        }
    }

    if (loadingUser) return <p style={{ padding: 24 }}>Verifiying User</p>;

    if(!user){
        return (
            <div style={{padding:24}}>
                <p>Login to view the Courses</p>
                <Link href="/auth/login">Login here</Link>
            </div>
        );
    }
return(
    <Page>
      <h1>Courses</h1>
      <div style={{ display: "flex", gap: "0.8rem", margin: "0.75rem 0 1.2rem" }}>
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
        Add a course, expand it, and add assignments inside it.
      </Muted>

      <Card>
        <form onSubmit={addCourse}>
          <Row>
            <Input
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              placeholder="Course name (eg: CMPSC 461)"
            />
            <Button type="submit">Add course</Button>
          </Row>
        </form>

        {err && <ErrorText>{err}</ErrorText>}

        <Accordion>
          {courses.length === 0 ? (
            <Muted>No courses yet.</Muted>
          ) : (
            courses.map((course) => {
              const isOpen = openCourse === course.id;

              return (
                <div key={course.id}>
                  <CourseHeader
                    onClick={() => {
                      setOpenCourse((prev) => (prev === course.id ? null : course.id));
                      setAsnTitle("");
                      setAsnDueDate("");
                      setAsnPriority(3);
                      setAsnNotes("");
                    }}
                  >
                    <span>{course.name}</span>
                    <span style={{ opacity: 0.8 }}>{isOpen ? "▾" : "▸"}</span>
                  </CourseHeader>

                  {isOpen && (
                    <CourseBody>
                      <h2 style={{ margin: 0 }}>Assignments</h2>

                      <form onSubmit={(e) => addAssignment(e, course.id)} style={{ marginTop: 10 }}>
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
                              value={asnTitle}
                              onChange={(e) => setAsnTitle(e.target.value)}
                              placeholder="Assignment title (e.g., HW 3)"
                            />
                          </Row>

                          <Row style={{ gridColumn: "1 / 2" }}>
                            <Input
                              type="date"
                              value={asnDueDate}
                              onChange={(e) => setAsnDueDate(e.target.value)}
                            />
                            <Button type="submit">Add assignment</Button>
                          </Row>

                          <Select
                            value={asnPriority}
                            onChange={(e) => setAsnPriority(Number(e.target.value))}
                            aria-label="Assignment priority"
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
                            value={asnNotes}
                            onChange={(e) => setAsnNotes(e.target.value)}
                            placeholder="Notes (optional) – shown in hover tooltip"
                            style={{ gridColumn: "1 / 2" }}
                          />
                        </div>
                      </form>

                      <AssignmentList>
                        {openAssignments.length === 0 ? (
                          <Muted style={{ marginTop: 10 }}>No assignments yet.</Muted>
                        ) : (
                          openAssignments.map((a) => (
                            <AssignmentRow key={a.id}>
                              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                                <b style={{ textDecoration: a.status === "done" ? "line-through" : "none" }}>
                                  {a.title}
                                </b>
                                <Pill>{a.status === "done" ? "done" : "todo"}</Pill>
                                <Pill>p{a.priority}</Pill>
                              </div>

                              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                <span style={{ opacity: 0.85 }}>due {a.dueDate}</span>
                                <Button
                                  type="button"
                                  onClick={() => toggleAsn(course.id, a.id, a.status)}
                                >
                                  {a.status === "done" ? "Mark todo" : "Mark done"}
                                </Button>
                              </div>

                              <Tooltip className="tooltip">
                                <Small>
                                  <div><b>{a.title}</b></div>
                                  <div>Due: <b>{a.dueDate}</b></div>
                                  <div>Priority: <b>{a.priority}</b></div>
                                  <div>Status: <b>{a.status}</b></div>
                                  {a.notes ? (
                                    <div>Notes: <b>{a.notes}</b></div>
                                  ) : (
                                    <div style={{ opacity: 0.7 }}>Notes: (none)</div>
                                  )}
                                </Small>
                              </Tooltip>
                            </AssignmentRow>
                          ))
                        )}
                      </AssignmentList>
                    </CourseBody>
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
