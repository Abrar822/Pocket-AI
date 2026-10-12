// import Sidebar_Compo from './Sidebar-compo'
// import './Sidebar.css'

// export default function Sidebar({
//     collapsed,
//     onDashboardClick,
//     onMemoryClick,
//     onSettingClick
// }) {

//     return (
//         <div className={`side-bar ${collapsed ? 'collapsed' : ''}`}>

//             <Sidebar_Compo
//                 onClick={onDashboardClick}
//                 compo="dashboard"
//                 collapsed={collapsed}
//             />

//             <Sidebar_Compo
//                 onClick={onMemoryClick}
//                 compo="memory"
//                 collapsed={collapsed}
//             />

//             <Sidebar_Compo
//                 onClick={onSettingClick}
//                 compo="setting"
//                 collapsed={collapsed}
//             />

//         </div>
//     )
// }

import Sidebar_Compo from "./Sidebar-compo";
import "./Sidebar.css";

export default function Sidebar({
  collapsed,
  onDashboardClick,
  onMemoryClick,
  onSettingClick,
}) {
  return (
    <div className={`side-bar ${collapsed ? "collapsed" : ""}`}>
      {/* Dashboard */}

      <Sidebar_Compo
        onClick={onDashboardClick}
        compo="dashboard"
        collapsed={collapsed}
      />

      {/* Memory */}

      <Sidebar_Compo
        onClick={onMemoryClick}
        compo="memory"
        collapsed={collapsed}
      />

      {/* Settings */}

      <Sidebar_Compo
        onClick={onSettingClick}
        compo="setting"
        collapsed={collapsed}
      />
    </div>
  );
}
