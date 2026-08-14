import Sidebar_Compo from './sidebar-compo'
import './Sidebar.css'

export default function Sidebar({collapsed}) {

    return (
    <div className={`side-bar ${collapsed ? 'collapsed' : ''}`}>
        <Sidebar_Compo compo={'dashboard'} collapsed={collapsed} />
        <Sidebar_Compo compo={'memory'} collapsed={collapsed}/>
        <Sidebar_Compo compo={'setting'} collapsed={collapsed}/>
    </div>
    )
}