import "./App.css";
import { useState } from "react";
import { Routes, Route, useNavigate, BrowserRouter } from "react-router-dom";
import Sidebar from "./components/home/Sidebar";
import Navbar from "./components/home/Nav";
import ChatSection from "./components/home/Chatsection";
import Dashboard from "./components/dashboard/Dashboard";
import SettingInfo from "./components/setting/Settinginfo";

function Home({theme, collapsed, setCollapsed}) {
  const [quickActionPrompt, setQuickActionPrompt] = useState("");
  const navigate = useNavigate();

  const handleDashboardClick = () => {
    navigate("/");
  };

  const handleSettingsClick = () => {
    navigate("/settings");
  };
  

  return (
    <div className={`app ${theme}`}>
      <Sidebar
        collapsed={collapsed}
        onDashboardClick={handleDashboardClick}
        onSettingClick={handleSettingsClick}
        theme={theme}
      />

      {/* <div className="app-content"> */}

      <Navbar
        onMenuClick={() =>
          setCollapsed((prev) => !prev)
        }
        theme={theme}
      />
      <div /*className="chat-container-wrapper"*/>
        <ChatSection quickActionPrompt={quickActionPrompt}
        clearQuickAction={() => setQuickActionPrompt("")} theme={theme}/>
      </div>

      {/* <main className="main-content"> */}

      <div className="orb-container">
        <Dashboard onQuickAction={setQuickActionPrompt} theme={theme}/>
      </div>


      {/* </main> */}

      {/* </div> */}

    </div>
  );
}

function SettingsPage({theme, setTheme, collapsed, setCollapsed}) {

  const navigate = useNavigate();

  const handleDashboardClick = () => {
    navigate("/");
  };
  const handleSettingsClick = () => {
    navigate("/settings");
  };

  return (
    <div className={`app ${theme}`}>
      <Sidebar
        collapsed={collapsed}
        onDashboardClick={handleDashboardClick}
        onSettingClick={handleSettingsClick}
        theme={theme}
      />

      <div className="app-content">
        <Navbar
          onMenuClick={() =>
            setCollapsed((prev) => !prev)
          }
          theme={theme}
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
  const [collapsed, setCollapsed] = useState(true);
  const [theme, setTheme] = useState("dark");
  return (
    
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home theme={theme} collapsed={collapsed} setCollapsed={setCollapsed}/>} />

        <Route path="/settings" element={<SettingsPage theme={theme} setTheme={setTheme} collapsed={collapsed} setCollapsed={setCollapsed}/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
