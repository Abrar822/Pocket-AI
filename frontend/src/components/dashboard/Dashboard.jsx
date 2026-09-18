import { useEffect, useState } from "react";

import {
  Code2,
  Globe,
  FileText,
  Play,
  Image,
  Mic,
  MicOff,
  icons,
  LockKeyhole
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

export default function Dashboard({ onQuickAction }) {

  const [orbSize, setOrbSize] = useState(() => {
    if (window.innerWidth <= 700) return 140;
    if (window.innerWidth <= 1100) return 170;
    return 190;
  });

  const [greeting, setGreeting] = useState(
    greetingForHour(new Date().getHours())
  );

  const [listening, setListening] = useState(true);

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
    <div className="pai-dashboard page-fade">

      <header className="pai-dash-header">
        <div>
          <h1>{greeting}, Het </h1>
          <p>Your personal AI productivity assistant</p>
        </div>
      </header>



      <session className="pai-dash-hero">

        <Orb
          size={orbSize}
          listening={listening}
          hint='Say "Hey Pocket" to wake me up'
        />

        <button
          className="pai-voice-btn"
          onClick={() => setListening((l) => !l)}
        >
          {listening ? (
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

      </session>

      <session>

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

      </session>

      <session>

        <h2 className="pai-section-title">
          Suggested Prompts
        </h2>

        <div className="pai-prompts">

          {PROMPTS.map((prompt) => (
            <div
              key={prompt}
              onClick={() =>
                alert(`Running: "${prompt}"`)
              }
            >
              {prompt}
            </div>
          ))}

        </div>

      </session>

    </div>
  );
}