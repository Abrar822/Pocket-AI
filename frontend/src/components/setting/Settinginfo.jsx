import { useState } from "react";
import { Palette, User, Mic, Moon, Sun, Save } from "lucide-react";
import "./Settinginfo.css";

function SettingInfo() {
  const [theme, setTheme] = useState("dark");
  const [username, setUsername] = useState("");
  const [wakeWord, setWakeWord] = useState("");
  const [voice, setVoice] = useState("male");

  const handleSave = () => {
    console.log({
      theme,
      username,
      wakeWord,
      voice,
    });

    alert("Settings saved!");
  };

  return (
    <div className="settings-page">
      {/* ================= HEADER ================= */}

      <div className="settings-header">
        <div className="settings-title">
          <h1>Settings</h1>

          <p>Customize your Pocket AI experience</p>
        </div>

        {/* <div className="settings-wave">~~~~~〰〰〰~~~~~</div> */}
      </div>

      {/* ================= SETTINGS CARD ================= */}
      <div className="settings-card">
        {/* ================= THEME ================= */}

        <div className="setting-row">
          <div className="setting-info">
            <div className="setting-icon">
              <Palette size={25} />
            </div>

            <div>
              <h2>Theme</h2>

              <p>Choose your preferred theme</p>
            </div>
          </div>

          <div className="setting-options">
            {/* Dark Mode */}

            <button
              className={`option-button ${theme === "dark" ? "selected" : ""}`}
              onClick={() => setTheme("dark")}
            >
              <Moon size={21} />

              <span>Dark Mode</span>

              {theme === "dark" && <span className="check">✓</span>}
            </button>

            {/* Light Mode */}

            <button
              className={`option-button ${theme === "light" ? "selected" : ""}`}
              onClick={() => setTheme("light")}
            >
              <Sun size={21} />

              <span>Light Mode</span>

              {theme === "light" && <span className="check">✓</span>}
            </button>
          </div>
        </div>

        {/* ================= USERNAME ================= */}

        <div className="setting-row">
          <div className="setting-info">
            <div className="setting-icon">
              <User size={25} />
            </div>

            <div>
              <h2>Username</h2>

              <p>Set your display name</p>
            </div>
          </div>

          <div className="input-container">
            <User size={21} />

            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
        </div>

        {/* ================= WAKE WORD ================= */}

        <div className="setting-row">
          <div className="setting-info">
            <div className="setting-icon">
              <Mic size={25} />
            </div>

            <div>
              <h2>Wake Word</h2>

              <p>Choose your wake word</p>
            </div>
          </div>

          <div className="input-wrapper">
            <div className="input-container">
              <Mic size={21} />

              <input
                type="text"
                placeholder="Enter wake word"
                value={wakeWord}
                onChange={(e) => setWakeWord(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ================= VOICE ================= */}

        <div className="setting-row">
          <div className="setting-info">
            <div className="setting-icon">
              <Mic size={25} />
            </div>

            <div>
              <h2>Voice</h2>

              <p>Select your preferred voice</p>
            </div>
          </div>

          <div className="setting-options">
            {/* Male */}

            <button
              className={`option-button ${voice === "male" ? "selected" : ""}`}
              onClick={() => setVoice("male")}
            >
              <span className="voice-symbol">♂</span>

              <span>Male Voice</span>

              {voice === "male" && <span className="check">✓</span>}
            </button>

            {/* Female */}

            <button
              className={`option-button ${
                voice === "female" ? "selected" : ""
              }`}
              onClick={() => setVoice("female")}
            >
              <span className="voice-symbol">♀</span>

              <span>Female Voice</span>

              {voice === "female" && <span className="check">✓</span>}
            </button>
          </div>
        </div>

        {/* ================= SAVE ================= */}

        <div className="save-container">
          <button className="save-button" onClick={handleSave}>
            <Save size={19} />

            <span>Save Changes</span>
          </button>
        </div>
      </div>
      </div>
    
  );
}

export default SettingInfo;
