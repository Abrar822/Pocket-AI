import {Menu} from "lucide-react";
import "./Menu.css";

export default function left_sidebar({onMenuClick}){
    return(
        <button className="left-sidebar-btn" onClick={onMenuClick}>
            <Menu className="left-sidebar-icon" size={25}/>
        </button>
    );
}