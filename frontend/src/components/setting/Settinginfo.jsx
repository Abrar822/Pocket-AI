import { useState, useEffect } from "react";
import { Palette, User, Mic, Moon, Sun, Save } from "lucide-react";
import "./Settinginfo.css";
import { settingInsert } from "../../helper/settingInsert";

function SettingInfo({
  theme,
  setTheme,
  username,
  setUsername,
  voice,
  setVoice,
  mode,
  setMode,
  wakeWord,
  setWakeWord,
}) {
  // const [wakeWord, setWakeWord] = useState("Pocket");
  // const [voice, setVoice] = useState("male");
  // const [mode, setMode] = useState("dark");

  // const onLoad = async () => {
  //   let data
  //     try {
  //       data = await settingConnect();
  //     } catch(err) {
  //       console.log(String(err))
  //       return
  //     }
  //     for (let tuple of data) {
  //       if (tuple[0] === "username") {
  //         setUsername(tuple[1].trim());
  //       } else if (tuple[0] === "wakeword") {
  //         setWakeWord(tuple[1].trim());
  //       } else if (tuple[0] === "voice") {
  //         setVoice(tuple[1].trim());
  //       } else if (tuple[0] === "mode") {
  //         setMode(tuple[1].trim());
  //         setTheme(tuple[1].toLowerCase().trim());
  //       }
  //     }
  //   };

  const insertDetails = async () => {
    if (!username || !wakeWord || !mode || !voice) return;

    let data = await settingInsert({
      username: username,
      wakeword: wakeWord,
      voice: voice,
      mode: mode,
    });

    if (!data) {
      alert("failure");
      return data.message;
    } else {
      alert("success");
      return "Successfully upserted data.";
    }
  };

  // useEffect(() => {
  //   onLoad();
  // }, []);

  return (
    <div className={`bg-setting ${theme}`}>
      <div className={`settings-page ${theme}`}>
        {/* ================= HEADER ================= */}

        <div className={`settings-header ${theme}`}>
          <div className={`settings-title ${theme}`}>
            <h1>Settings</h1>

            <p>Customize your Pocket AI experience</p>
          </div>

          {/* <div className="settings-wave">~~~~~〰〰〰~~~~~</div> */}
        </div>

        {/* ================= SETTINGS CARD ================= */}
        <div className={`settings-card ${theme}`}>
          {/* ================= THEME ================= */}

          <div className={`setting-row ${theme}`}>
            <div className={`setting-info ${theme}`}>
              <div className={`setting-icon ${theme}`}>
                <Palette size={25} />
              </div>

              <div>
                <h2>Theme</h2>

                <p>Choose your preferred theme</p>
              </div>
            </div>

            <div className={`setting-options ${theme}`}>
              {/* Dark Mode */}

              <button
                className={`option-button ${theme === "dark" ? "selected" : ""}`}
                onClick={() => {
                  setTheme("dark");
                  setMode("dark");
                }}
              >
                <Moon size={21} />

                <span>Dark Mode</span>

                {theme === "dark" && <span className="check">✓</span>}
              </button>

              {/* Light Mode */}

              <button
                className={`option-button ${theme === "light" ? "selected" : ""}`}
                onClick={() => {
                  setTheme("light");
                  setMode("light");
                }}
              >
                <Sun size={21} />

                <span>Light Mode</span>

                {theme === "light" && <span className="check">✓</span>}
              </button>
            </div>
          </div>

          {/* ================= USERNAME ================= */}

          <div className={`setting-row ${theme}`}>
            <div className={`setting-info ${theme}`}>
              <div className={`setting-icon ${theme}`}>
                <User size={25} />
              </div>

              <div>
                <h2>Username</h2>

                <p>Set your display name</p>
              </div>
            </div>

            <div className={`input-container ${theme}`}>
              <User size={21} />

              <input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => {
                  if (e.target.value.trim().length > 0)
                    setUsername(e.target.value);
                }}
              />
            </div>
          </div>

          {/* ================= WAKE WORD ================= */}

          <div className={`setting-row ${theme}`}>
            <div className={`setting-info ${theme}`}>
              <div className={`setting-icon ${theme}`}>
                <Mic size={25} />
              </div>

              <div>
                <h2>Wake Word</h2>

                <p>Choose your wake word</p>
              </div>
            </div>

            <div className={`input-wrapper ${theme}`}>
              <div className={`input-container ${theme}`}>
                <Mic size={21} />

                <input
                  type="text"
                  placeholder="Enter wake word"
                  value={wakeWord}
                  onChange={(e) => {
                    if (e.target.value.trim().length > 0)
                      setWakeWord(e.target.value);
                  }}
                />
              </div>
            </div>
          </div>

          {/* ================= VOICE ================= */}

          <div className={`setting-row ${theme}`}>
            <div className={`setting-info ${theme}`}>
              <div className={`setting-icon ${theme}`}>
                <Mic size={25} />
              </div>

              <div>
                <h2>Voice</h2>

                <p>Select your preferred voice</p>
              </div>
            </div>

            <div className={`setting-options ${theme}`}>
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

          <div className={`save-container ${theme}`}>
            <button className="save-button" onClick={insertDetails}>
              <Save size={19} />

              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingInfo;
