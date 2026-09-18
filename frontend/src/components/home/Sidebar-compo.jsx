import { LayoutDashboard,Database,Settings } from 'lucide-react';
import './Sidebar-compo.css'

function Sidebar_Compo({compo,collapsed,onClick}) {
    const handleClick = () =>{
            if (onClick) {
                onClick();
            }
        
    };
    return (
        compo === 'dashboard' ?
        <div onClick={handleClick} className={`${collapsed ? 'sidebar-collapsed' :'container'} `}>
            <LayoutDashboard className={collapsed ? 'logo-collapsed' :'logo'} />
            <p className={collapsed ? 'sidebar-text' : ''}>Dashboard</p>
        </div>
        :
        compo === 'memory' ?
        <div className={collapsed ? 'sidebar-collapsed' :'container'}>
            <Database className={collapsed ? 'logo-collapsed' :'logo'} />
            <p className={collapsed ? 'sidebar-text' : ''}>Memory</p>
        </div>
        :
        compo === 'setting' &&
        <div onClick={handleClick} className={collapsed ? 'sidebar-collapsed' :'container'}>
            <Settings className={collapsed ? 'logo-collapsed' :'logo'}/>
            <p className={collapsed ? 'sidebar-text' : ''}>Settings</p>
        </div>
    )
}

export default Sidebar_Compo