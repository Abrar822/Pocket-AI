import {useState} from "react";
import { Settings } from "lucide-react";
import "./Setting_logo.css";

function Setting(){
    const [rotate, setRotate] = useState(false);

    const handleClick = () =>{
        setRotate(!rotate);
    };
    return(
        <button className="setting-btn" onClick={handleClick}>
            <Settings className={rotate? "rotate" : ""} size={27}/>
        </button>
    );

}
export default Setting;