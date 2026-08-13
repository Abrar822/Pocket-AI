import Sidebar_Compo from './sidebar-compo'
// import Left_sidebar from './Left_sidebar';
import './Sidebar.css'

export default function Sidebar({collapsed}) {

    return (
    <div className={collapsed ? 'side-bar-collapsed' :'side-bar'}>
        {/* <Left_sidebar collapsed={collapsed} isCollapsed={() => setCollapsed(prev => !prev)}/> */}
        <Sidebar_Compo compo={'dashboard'} collapsed={collapsed} />
        <Sidebar_Compo compo={'memory'} collapsed={collapsed}/>
        <Sidebar_Compo compo={'setting'} collapsed={collapsed}/>
    </div>
    )
}