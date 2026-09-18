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
          onMenuClick={() => {
            setCollapsed((prev) => !prev);
          }}
        />

        <main className="main-content">
          <div className="orb-container">
            <Dashboard />
          </div>

          <div /*className="chat-container-wrapper"*/>
            <ChatSection />
          </div>
        </main>
      </div>
    </div>
  );
}

function SettingsPage({theme, setTheme}) {
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
          onMenuClick={() => {
            setCollapsed((prev) => !prev);
          }}
        />

        <main className="main-content">
          <SettingInfo theme={theme} setTheme={setTheme}/>
        </main>
        <div /*className="chat-container-wrapper"*/>
          <ChatSection theme={theme}/>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [theme, setTheme] = useState("dark");
  return (
    
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/settings" element={<SettingsPage theme={theme} setTheme={setTheme}/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
