import { useEffect,useState }  from "react";
import link from "next/link";
import { addDoc,collection,onSnapshot,orderBy,query } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import {auth, databse} from "@/library/firebaseConfig";

export default function Courses(){
    const [user,setUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);
    
    const [courseName, setCourseName] = useState("");
    const [courses, setCourses] = useState([]);
    const [err,setErr] = useState("");

    
}
