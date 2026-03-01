export default async function handler(req,res){
    try{
         const city = req.query.city || "State College";
         const key = process.env.OPENWEATHER_API_KEY;

         if(!key) return res.status().json({message: "Missing Openweather API key"});

         const url = https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}` +
      `&appid=${key}&units=imperial`;
    }  catch(){

    }  
}