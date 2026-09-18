import "./App.css";
import { useState } from "react";
import { Routes, Route, useNavigate, BrowserRouter } from "react-router-dom";
import Sidebar from "./components/home/Sidebar";
import Navbar from "./components/home/Nav";
import ChatSection from "./components/home/Chatsection";
import Dashboard from "./components/dashboard/Dashboard";
import SettingInfo from "./components/setting/Settinginfo";

function Home() {
  const [collapsed, setCollapsed] = useState(true);
  const [open,setIsOpen] = useState(true);

  const navigate = useNavigate();

  const handleDashboardClick = () => {
    navigate("/");
  };

  const handleSettingsClick = () => {
    navigate("/settings");
  };
  const toggle = () => {
      setIsOpen(!open);
    };
  const close=()=>{
    if (open===true) {
      setIsOpen(false)
    }
  };

  return (
    <div className="app">
      <Sidebar
        collapsed={collapsed}
        onDashboardClick={handleDashboardClick}
        onSettingClick={handleSettingsClick}
      />

      {/* <div className="app-content"> */}

        <Navbar
          onMenuClick={() =>
            setCollapsed((prev) => !prev)
          }
        />
          <div /*className="chat-container-wrapper"*/>
            <ChatSection open={open} toggle={toggle} />
          </div>

        {/* <main className="main-content"> */}

          <div className="orb-container">
            <Dashboard toggle={close}/>
          </div>  


        {/* </main> */}

      {/* </div> */}

    </div>
  );
}

function SettingsPage() {
  const [collapsed, setCollapsed] = useState(true);

  const navigate = useNavigate();

  const handleDashboardClick = () => {
    navigate("/");
  };

  const handleSettingsClick = () => {
    navigate("/settings");
  };

  return (
    <div className="app">
      <Sidebar
        collapsed={collapsed}
        onDashboardClick={handleDashboardClick}
        onSettingClick={handleSettingsClick}
      />

      <div className="app-content">
        <Navbar
          onMenuClick={() =>
            setCollapsed((prev) => !prev)
          }
        />

        <main className="main-content">
          <SettingInfo />
        </main>
        <div /*className="chat-container-wrapper"*/>
          <ChatSection />
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
