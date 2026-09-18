import { useEffect, useState } from "react";

import {
  Code2,
  Globe,
  FileText,
  Mail,
  Play,
  Image,
  Mic,
  MicOff,
} from "lucide-react";

import Orb from "./Orb";
import "./Dashboard.css";


const ACTIONS = [
  { icon: Code2, label: "Open VS Code" },
  { icon: Globe, label: "Open Chrome" },
  { icon: FileText, label: "Summarize PDF" },
  { icon: Mail, label: "Write Email" },
  { icon: Play, label: "Open YouTube" },
  { icon: Image, label: "Take Screenshot" },
];

const PROMPTS = [
  "Open GitHub",
  "Search latest AI news",
  "Summarize Resume.pdf",
  "Generate meeting email",
];

function greetingForHour(hour) {
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

export default function Dashboard({toggle}) {
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

  return (
      <div className="pai-dashboard page-fade" onClick={toggle}>
        
        <header className="pai-dash-header">
          <div>
            <h1>{greeting}, Het </h1>
            <p>Your personal AI productivity assistant</p>
          </div>
        </header>



        <session className="pai-dash-hero">

          <Orb
            size={230}
            listening={listening}
            hint='Say "Hey Pocket" to wake me up'
          />

          <button
            className="pai-voice-btn"
            onClick={() => setListening((l) => !l)}
          >
            {listening ? (
              <>
                <Mic size={20} strokeWidth={2}  />
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
                onClick={() => alert(action.label)}
              >
                <Icon
                  className="pai-action-icon"
                  size={30}
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
              "{prompt}"
            </div>
          ))}

        </div>

      </session>

    </div>
  );
}