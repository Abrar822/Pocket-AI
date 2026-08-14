import "./Nav.css";
import Timer from "./Timer";
import Setting from "./Setting_logo";
import Logo from "./Logo";
import Left_sidebar from "./Menu";

function Navbar({onMenuClick, onSettingClick}) {
  return (
    <nav className="navbar">
      <div className="nav-left">
        <div className="left-sidebar-icon">
          <Left_sidebar onMenuClick={onMenuClick}/>
        </div>
        <div className="nav-logo">
          <Logo />
        </div>
      </div>
      <div className="nav-right">
        <div className="nav-timer">
          <Timer />
        </div>

        <div className="nav-setting-logo">
          <Setting onClick={onSettingClick}/>
        </div>
      </div>
    </nav>
  );
}
export default Navbar;