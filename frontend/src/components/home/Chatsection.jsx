import { useState, useRef, useEffect } from "react";
import "./Chatsection.css";

import {
  MessageCircleMore,
  X,
  FilePlus,
  ArrowUp,
} from "lucide-react";

import { sendPrompt } from "../../services/api";

function ChatSection({
  quickActionPrompt,
  clearQuickAction,
  theme,
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [open, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef(null);

  const draggerRef = useRef(null);
  const chatboxRef = useRef(null);

  /* =========================================================
     TOGGLE CHAT
     ========================================================= */

  const toggle = () => {
    setIsOpen((prev) => !prev);
  };


  /* =========================================================
     RESIZE CHAT BOX
     ========================================================= */

  useEffect(() => {
    let draggable = false;
    let rect;

    const dragger = draggerRef.current;

    if (!dragger) return;

    const pointerDown = () => {
      if (!chatboxRef.current) return;

      draggable = true;

      rect = chatboxRef.current.getBoundingClientRect();

      document.body.style.userSelect = "none";
    };

    const pointerMove = (e) => {
      if (!draggable || !chatboxRef.current) return;

      const delta = rect.left - e.clientX;

      const newWidth = Math.max(
        400,
        Math.min(840, rect.width + delta)
      );

      chatboxRef.current.style.width = `${newWidth}px`;
    };

    const pointerUp = () => {
      draggable = false;

      document.body.style.userSelect = "";
    };

    dragger.addEventListener(
      "pointerdown",
      pointerDown
    );

    document.addEventListener(
      "pointermove",
      pointerMove
    );

    document.addEventListener(
      "pointerup",
      pointerUp
    );

    return () => {
      dragger.removeEventListener(
        "pointerdown",
        pointerDown
      );

      document.removeEventListener(
        "pointermove",
        pointerMove
      );

      document.removeEventListener(
        "pointerup",
        pointerUp
      );

      document.body.style.userSelect = "";
    };
  }, []);


  /* =========================================================
     SEND MESSAGE
     ========================================================= */

  const sendMessage = async (messageText = input) => {
    if (!messageText || messageText.trim() === "") {
      return;
    }

    const userInput = messageText.trim();

    const newMessage = {
      text: userInput,
      sender: "user",
    };

    setMessages((prev) => [
      ...prev,
      newMessage,
    ]);

    setInput("");

    setLoading(true);

    try {
      const data = await sendPrompt(userInput);

      const botReply = {
        text: data.response,
        sender: "bot",
      };

      setMessages((prev) => [
        ...prev,
        botReply,
      ]);
    } catch (error) {
      console.error("FastAPI Error:", error);

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Sorry, I couldn't process your request.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };


  /* =========================================================
     QUICK ACTION
     ========================================================= */

  useEffect(() => {
    if (quickActionPrompt?.trim()) {
      sendMessage(quickActionPrompt);
      clearQuickAction();
    }
  }, [quickActionPrompt]);


  /* =========================================================
     AUTO SCROLL
     ========================================================= */

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, loading]);


  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <>
      {/* =====================================================
          CHAT OPEN BUTTON
          ===================================================== */}

      <button
        onClick={toggle}
        className={open ? "btn-open" : "btn-close"}
        style={{
          backgroundColor: "transparent",
          border: "none",
        }}
      >
        <MessageCircleMore
          className={`chat-icon ${theme}`}
        />
      </button>


      {/* =====================================================
          CHAT CONTAINER
          ===================================================== */}

      <div
        ref={chatboxRef}
        className={`chat-container ${
          open ? "open" : "close"
        } ${theme}`}
      >

        {/* Resize handle */}

        <div
          ref={draggerRef}
          className="resize-handle"
        />


        {/* ===================================================
            CLOSE BUTTON
            =================================================== */}

        <div className={`chat-X ${theme}`}>
          <button
            onClick={toggle}
            className={`chat-icon-X ${theme}`}
            aria-label="Close chat"
          >
            <X />
          </button>
        </div>


        {/* ===================================================
            MESSAGE AREA

            ONLY THIS AREA WILL SCROLL
            =================================================== */}

        <div
          className={`messages ${theme}`}
        >

          {messages.map((msg, index) => (
            <div
              key={index}
              className={
                msg.sender === "user"
                  ? "messageuser"
                  : "messagebot"
              }
            >
              {msg.text}
            </div>
          ))}


          {/* Typing indicator */}

          {loading && (
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}


          {/* Auto scroll target */}

          <div
            ref={bottomRef}
            className="bottom-anchor"
          />

        </div>


        {/* ===================================================
            INPUT AREA

            THIS WILL NOT SCROLL
            =================================================== */}

        <div className={`chat-input ${theme}`}>

          {/* File button */}

          <button
            type="button"
            aria-label="Attach file"
          >
            <FilePlus />
          </button>


          {/* Text input */}

          <textarea
            className={theme}
            value={input}
            rows={3}
            wrap="soft"
            placeholder="Type a message..."
            onChange={(e) => {
              setInput(e.target.value);
            }}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !e.shiftKey
              ) {
                e.preventDefault();

                sendMessage();
              }
            }}
          />


          {/* Send button */}

          <button
            type="button"
            onClick={() => sendMessage()}
            aria-label="Send message"
          >
            <ArrowUp />
          </button>

        </div>

      </div>
    </>
  );
}

export default ChatSection;