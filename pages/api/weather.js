export default async function handler(req,res){
    try{
         const city = req.query.city || "State College";
         const key = process.env.OPENWEATHER_API_KEY;

         if(!key) return res.status().json({message: "Missing Openweather API key"});

         const url =`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}`+`&appid=${key}&units=imperial`;
         
         const r = await fetch(url);
         const data = await r.json();

         if(!r.ok) return res.status(r.status).json({message: data?.message || "Weather Request Failed"});
        
         return res.status(200).json({
            city:data.name,
            temp:Math.round(data.main.temp),
            description: data.weather?.[0]?.description ?? "NA",
            icon: data.weather?.[0].icon ?? null,
         });
        }  catch(e){
                return res.status(500).json({message: e.message});
    }  
}