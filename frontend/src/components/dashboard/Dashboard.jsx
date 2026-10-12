import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

import {
  Code2,
  Globe,
  FileText,
  Play,
  Image,
  Mic,
  MicOff,
  LockKeyhole,
  Loader2,
  AlertCircle
} from "lucide-react";

import Orb from "./Orb";
import "./Dashboard.css";


const ACTIONS = [
  { icon: Code2, label: "Open VS Code" ,prompt: "open VS code"},
  { icon: Globe, label: "Open Chrome" ,prompt: "Open Chrome" },
  { icon: FileText, label: "Summarize PDF" ,prompt: ""},
  // { icon: Mail, label: "Write Email" ,},
  {icon: LockKeyhole, label: "Lock Screen", prompt: "Lock the screen of PC"},
  { icon: Play, label: "Open YouTube" , prompt: "Open Youtube"},
  { icon: Image, label: "Take Screenshot" , prompt: "Take screenshot of current window"},
];

const PROMPTS = [
  "Search machine learning playlist on YouTube",
  "Write an email for 7 days leave as I am out of city",
  "Summarize amazon",
  "Set brightness to 20",
];

function greetingForHour(hour) {
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

export default function Dashboard({ onQuickAction, theme, username, wakeWord }) {

  const [orbSize, setOrbSize] = useState(() => {
    if (window.innerWidth <= 700) return 140;
    if (window.innerWidth <= 1100) return 170;
    return 190;
  });

  const [greeting, setGreeting] = useState(
    greetingForHour(new Date().getHours())
  );

  const [listening, setListening] = useState(false);
  const [ready, setReady] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [transcript, setTranscript] = useState("Initializing voice engine...");
  const [voiceError, setVoiceError] = useState("");

  // Connect Dashboard to the existing Tauri/Python voice engine.
  useEffect(() => {
    let unlistenVoice;
    let unlistenShortcut;
    let mounted = true;

    const setupVoiceListeners = async () => {
      try {
        unlistenVoice = await listen("voice-event", (event) => {
          const data = event.payload;
          if (!mounted || !data) return;

          const type = data.type || data.event;

          if (type === "ready") {
            setReady(true);
            setVoiceError("");
            setTranscript("Ready. Click Start Listening to speak.");
          } else if (type === "wake_word") {
            setListening(true);
            setProcessing(false);
            setVoiceError("");
            setTranscript(data.text || "Hey Pocket detected. Listening...");
          } else if (type === "listening") {
            setListening(true);
            setProcessing(false);
            setVoiceError("");
            setTranscript(data.text || "Listening... Speak now.");
          } else if (type === "processing") {
            setProcessing(true);
            setTranscript("Processing your voice...");
          } else if (type === "transcription" || type === "text") {
            const result = data.text || data.transcript || "";
            if (typeof result === "string" && result.trim()) {
              setTranscript(result.trim());
            }
            setProcessing(false);
            if (type === "transcription") setListening(false);
          } else if (type === "stopped" || type === "waiting") {
            setListening(false);
            setProcessing(false);
            if (data.text) setTranscript(data.text);
            else if (type === "stopped") setTranscript("Listening stopped.");
          } else if (type === "error") {
            setVoiceError(data.message || data.error || "Voice engine error.");
            setListening(false);
            setProcessing(false);
          }
        });

        unlistenShortcut = await listen("shortcut-voice-toggle", (event) => {
          if (!mounted) return;
          const active = Boolean(event.payload);
          setListening(active);
          setProcessing(false);
          setVoiceError("");
          setTranscript(active ? "Listening... Speak now." : "Listening stopped.");
        });

        // If the ready event fired before this component mounted,
        // enable controls once the event listeners are connected.
        if (mounted) {
          setReady(true);
          setTranscript("Voice controls connected. Use Ctrl + Alt + A to toggle listening.");
        }
      } catch (error) {
        console.error("Voice listener setup error:", error);
        if (mounted) setVoiceError("Failed to initialize voice event listeners.");
      }
    };

    setupVoiceListeners();

    return () => {
      mounted = false;
      if (unlistenVoice) unlistenVoice();
      if (unlistenShortcut) unlistenShortcut();
    };
  }, []);

  const toggleListening = async () => {
    setVoiceError("");
    try {
      if (listening) {
        await invoke("stop_listening");
        setListening(false);
        setProcessing(false);
        setTranscript("Listening stopped.");
      } else {
        await invoke("start_listening");
        setListening(true);
        setProcessing(false);
        setTranscript("Listening... Speak now.");
      }
    } catch (error) {
      console.error("Voice toggle error:", error);
      setVoiceError(String(error));
      setListening(false);
    }
  };

  // Update greeting every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setGreeting(greetingForHour(new Date().getHours()));
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 700) {
        setOrbSize(140);
      } else if (window.innerWidth <= 1100) {
        setOrbSize(170);
      } else {
        setOrbSize(190);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className={`pai-dashboard page-fade ${theme}`}>

      <header className="pai-dash-header">
        <div>
          <h1>{greeting}, {username} </h1>
          <p>Your personal AI productivity assistant</p>
        </div>
      </header>

      <section className="pai-dash-hero">

        <Orb
          size={orbSize}
          listening={listening}
          hint={`Say ${wakeWord} to wake me up`}
          theme={theme}
        />

        <button
          className="pai-voice-btn"
          onClick={toggleListening}
          disabled={!ready || processing}
        >
          {processing ? (
            <>
              <Loader2 size={20} className="pai-voice-spinner" />
              Processing...
            </>
          ) : listening ? (
            <>
              <Mic size={20} strokeWidth={2} />
              Talk with Pocket AI
            </>
          ) : (
            <>
              <MicOff size={20} strokeWidth={2} />
              Start Listening
            </>
          )}
        </button>

        <div className={`pai-voice-transcript ${listening ? "active" : ""}`} aria-live="polite">
          {/* <span className="pai-voice-status">
            {processing ? "Processing" : listening ? "Listening" : ready ? "Voice ready" : "Loading voice engine"}
          </span> */}
          <p>{transcript}</p>
          {voiceError && (
            <div className="pai-voice-error">
              <AlertCircle size={16} />
              <span>{voiceError}</span>
            </div>
          )}
        </div>

      </section>

      <section>

        <h2 className="pai-section-title">
          Quick Actions
        </h2>

        <div className="pai-actions">

          {ACTIONS.map((action) => {
            const Icon = action.icon;

            return (
              <div
                className="pai-action"
                key={action.label}
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickAction(action.prompt);
                }}
              >
                <Icon
                  className="pai-action-icon"
                  size={24}
                  strokeWidth={1.8}
                />

                <h3>{action.label}</h3>
              </div>
            );
          })}

        </div>

      </section>

      <section>

        <h2 className="pai-section-title">
          Suggested Prompts
        </h2>

        <div className="pai-prompts">

          {PROMPTS.map((prompt) => (
            <div
              key={prompt}
              onClick={(e) =>
              {
                e.stopPropagation();
                onQuickAction(prompt);
              }
              }
            >
              {prompt}
            </div>
          ))}

        </div>

      </section>

    </div>
  );
}