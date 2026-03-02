import { getToken } from "next-auth/jwt";

export default async function handler(req,res) {
    try{
        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
        if (!token?.accessToken) {
            return res.status(401).json({message: "not signed in with google"});
        }
        const now=new Date();
        const start= new Date(now.getFullYear(),now.getMonth(),now.getDate()).toISOString();
        const end= new Date(now.getFullYear(),now.getMonth(),now.getDate()+1).toISOString();

        const url="https://www.googleapis.com/calendar/v3/calendars/primary/events"+`?timeMin=${encodeURIComponent(start)}`+`&timeMax=${encodeURIComponent(end)}`+`&singleEvents=true&orderBy=startTime`;

        const r = await fetch(url, {
            headers: { Authorization: `Bearer ${token.accessToken}` },
        });

        const data = await r.json();
        if(!r.ok){
            return res.status(r.status).json({message:data?.error?.message || "Calendar Failed"});
        }

        const events=(data.items||[]).map((ev)=>({
            id: ev.id,
            title: ev.summary || "(no title)",
            start: ev.start?.dateTime || ev.start?.date,
            end:ev.end?.dateTime || ev.end?.date,
        }));

        return res.status(200).json({events});
    } catch(e){
        return res.status(500).json({message: e.message})
    }
}