import { LayoutDashboard,Database,Settings } from 'lucide-react';
import './sidebar-compo.css'

function Sidebar_Compo({compo,collapsed}) {
    return (
        compo === 'dashboard' ?
        <div className={collapsed ? 'sidebar-collapsed' :'container'}>
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
        <div className={collapsed ? 'sidebar-collapsed' :'container'}>
            <Settings className={collapsed ? 'logo-collapsed' :'logo'}/>
            <p className={collapsed ? 'sidebar-text' : ''}>Settings</p>
        </div>
    )
}

export default Sidebar_Compo