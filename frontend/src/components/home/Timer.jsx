import {useState,useEffect} from "react";
import "./Timer.css";

function Timer(){
    const [time,setTime] = useState(new Date());
    useEffect(() => {
        const interval = setInterval(()=>{
            setTime(new Date());
        },1000);

        return () => clearInterval(interval);
    },[]);

    return(
        <>
        {time.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
})}
        </>
    );
}
export default Timer;