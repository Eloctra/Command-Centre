import { use, useEffect,useState }  from "react";
import Link from "next/link";
import { addDoc,collection,onSnapshot,orderBy,query,updateDoc} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import {auth, database} from "@/library/firebaseConfig";

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

    useEffect(()=>{                                                             //Authentication Guard
        const current = auth.currentUser;   //Stuck on loading, thought it was due to some kind of state switching so checked if logged in, and if they are set loading to false
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

    useEffect(()=> {                                                           //To read as updated
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

    useEffect(()=>{                 //Assignments for currently open courses
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

    async function addCourse(e){            //Creates courses
        e.preventDefault();
        setErr("")

        if(!courseName.trim()) return;
        
        try{
            await addDoc(collection(database,"users",user.uid,"courses"),{
                name: courseName.trim(),
                createdAt: Date.now()
            });
            setCourseName("");
            setOpenCourse(ref.id)

            setAsnTitle("");            //reset asn form for new course viewed
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

        if(!asnTitle.trim()) return;
        if(!asnDueDate) return;

        try{
            await addDoc(collection(database,"users",user.uid,"courses",courseId,"assignments"),
        {
            title,
            duedate:asnDueDate,
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

    

    if (loadingUser) return <p style={{ padding: 24 }}>Loading...</p>;

    if(!user){
        return (
            <div style={{padding:24}}>
                <p>Login to view the Courses</p>
                <Link href="/auth/login">Login here</Link>
            </div>
        );
    }
return(
    <div style={{ padding: 24, maxWidth: 700 }}>
      <h1>Courses</h1>

      <form onSubmit={addCourse} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          value={courseName}
          onChange={(e) => setCourseName(e.target.value)}
          placeholder="Course name (e.g: CMPSC 263)"
          style={{ flex: 1, padding: 8 }}
        />
        <button type="submit">Add</button>
      </form>

      {err && <p style={{ color: "salmon" }}>{err}</p>}

      <h2>Your courses</h2>
      {courses.length === 0 ? (
        <p>No courses yet.</p>
      ) : (
        <ul>
          {courses.map((c) => (
            <li key={c.id}>{c.name}</li>
          ))}
        </ul>
      )}
    </div>
);

}
