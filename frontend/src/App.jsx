import "./App.css";
import {
  Routes,
  Route,
  useNavigate,
  BrowserRouter
} from "react-router-dom";

import Sidebar from "./components/home/Sidebar";
import Navbar from "./components/home/Nav";
import ChatSection from "./components/home/Chatsection";
import Dashboard from "./components/dashboard/Dashboard";
import SettingInfo from "./components/setting/Settinginfo";

import { useState, useEffect } from "react";

import { settingConnect } from "./helper/settingConnect";
import Alert from "./components/alert/Alert";


/* =========================================================
   HOME / DASHBOARD
========================================================= */

function Home({
  theme,
  collapsed,
  setCollapsed,
  username,
  wakeWord,
  quickActionPrompt,
  setQuickActionPrompt
}) {
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

      <Navbar
        onMenuClick={() => setCollapsed((prev) => !prev)}
        theme={theme}
      />

      <div>
        <Dashboard
          onQuickAction={setQuickActionPrompt}
          theme={theme}
          username={username}
          wakeWord={wakeWord}
        />
      </div>

    </div>
  );
}


/* =========================================================
   SETTINGS PAGE
========================================================= */

function SettingsPage({
  theme,
  setTheme,
  collapsed,
  setCollapsed,
  username,
  setUsername,
  voice,
  setVoice,
  mode,
  setMode,
  wakeWord,
  setWakeWord,
  setInformer
}) {
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
          onMenuClick={() => setCollapsed((prev) => !prev)}
          theme={theme}
        />

        <main className="main-content">

          <SettingInfo
            theme={theme}
            setTheme={setTheme}

            username={username}
            setUsername={setUsername}

            setVoice={setVoice}

            setMode={setMode}
            mode={mode}

            wakeWord={wakeWord}
            setWakeWord={setWakeWord}

            voice={voice}

            setInformer={setInformer}
          />

        </main>

      </div>

    </div>
  );
}


/* =========================================================
   APP
========================================================= */

function App() {

  /* =====================================================
     GLOBAL SETTINGS STATE
  ===================================================== */

  const [collapsed, setCollapsed] = useState(true);

  const [theme, setTheme] = useState("dark");

  const [username, setUsername] = useState("");

  const [wakeWord, setWakeWord] = useState("Pocket");

  const [voice, setVoice] = useState("male");

  const [mode, setMode] = useState("dark");


  /* =====================================================
     GLOBAL CHAT STATE
  ===================================================== */

  const [quickActionPrompt, setQuickActionPrompt] = useState("");


  /* =====================================================
     INFORMER
  ===================================================== */

  const [informer, setInformer] = useState({
    state: false,
    msg: ""
  });


  /* =====================================================
     INFORMER TIMEOUT
  ===================================================== */

  useEffect(() => {

    let id;

    if (informer.state) {

      id = setTimeout(() => {

        setInformer({
          state: false,
          msg: ""
        });

      }, 3000);
    }

    return () => {
      clearTimeout(id);
    };

  }, [informer]);


  /* =====================================================
     LOAD SETTINGS
  ===================================================== */

  const onLoad = async () => {

    let data;

    try {

      data = await settingConnect();

    } catch (err) {

      console.log(String(err));

      return;
    }

    for (let tuple of data) {

      if (tuple[1] === "username") {

        setUsername(tuple[2].trim());

      } else if (tuple[1] === "wakeword") {

        setWakeWord(tuple[2].trim());

      } else if (tuple[1] === "voice") {

        setVoice(tuple[2].trim());

      } else if (tuple[1] === "mode") {

        setMode(tuple[2].trim());

        setTheme(tuple[2].toLowerCase().trim());
      }
    }
  };


  useEffect(() => {

    onLoad();

  }, []);


  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <BrowserRouter>

      {/* ================================================
          ALERT
      ================================================= */}

      {informer.state && (
        <Alert message={informer.msg} />
      )}


      {/* ================================================
          PAGES
      ================================================= */}

      <Routes>

        <Route
          path="/"
          element={
            <Home
              theme={theme}

              collapsed={collapsed}
              setCollapsed={setCollapsed}

              username={username}
              wakeWord={wakeWord}

              quickActionPrompt={quickActionPrompt}
              setQuickActionPrompt={setQuickActionPrompt}
            />
          }
        />


        <Route
          path="/settings"
          element={
            <SettingsPage
              theme={theme}
              setTheme={setTheme}

              collapsed={collapsed}
              setCollapsed={setCollapsed}

              username={username}
              setUsername={setUsername}

              voice={voice}
              setVoice={setVoice}

              mode={mode}
              setMode={setMode}

              wakeWord={wakeWord}
              setWakeWord={setWakeWord}

              setInformer={setInformer}
            />
          }
        />

      </Routes>


      {/* ================================================
          GLOBAL CHAT

          IMPORTANT:
          This is outside Routes.

          Therefore ChatSection does NOT unmount
          when changing pages.
      ================================================= */}

      <ChatSection
        theme={theme}

        quickActionPrompt={quickActionPrompt}

        clearQuickAction={() => {
          setQuickActionPrompt("");
        }}
      />

    </BrowserRouter>
  );
}

export default App;