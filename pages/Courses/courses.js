import { useEffect,useState }  from "react";
import Link from "next/link";
import { addDoc,collection,onSnapshot,orderBy,query, snapshotEqual } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import {auth, databse} from "@/library/firebaseConfig";

export default function Courses(){
    const [user,setUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);
    
    const [courseName, setCourseName] = useState("");
    const [courses, setCourses] = useState([]);
    const [err,setErr] = useState("");

    useEffect(()=>{                                                             //Authentication Guard
        const unsub = onAuthStateChanged(auth, (u)=>{
            setUser(u ?? null);
            setLoadingUser(false);
        });
        return unsub();
    },[]);

    useEffect(()=> {                                                           //To read as updated
        if (!user) return;
        
        const q=query(
            collection(databse,"users",user.uid,"courses"),
            orderBy("createdAt","desc")
        );

        const unsub = onSnapshot(
            q, (snap)=> setCourses(snap.docs.map((d) => ({ id: d.id, ...d.data() }))), 
            (e)=> setErr(e.message)
        );

        return()=>unsub();
    },[user]);

    async function addCourse(e){
        e.preventDefault();
        setErr("")

        if(!courseName.trim()) return;
        
        try{
            await addDoc(collection(databse,"users",user.uid,"courses"),{
                name: courseName.trim(),
                createdAt: Date.now()
            });
            setCourseName("");
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
          placeholder="Course name (e.g., CMPSC 263)"
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
