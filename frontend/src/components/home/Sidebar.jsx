import Sidebar_Compo from './Sidebar-compo'
import './Sidebar.css'

export default function Sidebar({collapsed,onDashboardClick,onSettingClick}) {

    return (
    <div className={`side-bar ${collapsed ? 'collapsed' : ''}`}>
        <Sidebar_Compo onClick={onDashboardClick} compo={'dashboard'} collapsed={collapsed}/>
        <Sidebar_Compo onClick={onDashboardClick}compo={'memory'} collapsed={collapsed}/>
        <Sidebar_Compo onClick={onSettingClick} compo={'setting'} collapsed={collapsed}/>
    </div>
    )
}