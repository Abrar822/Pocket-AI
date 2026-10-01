import { useState, useRef, useEffect } from "react";
import "./Chatsection.css";
<<<<<<< HEAD

import {
  MessageCircleMore,
  X,
  FilePlus,
  ArrowUp,
  FileText
} from "lucide-react";

import { sendPrompt } from "../../services/api";

function ChatSection({
  quickActionPrompt,
  clearQuickAction,
  theme,
  chatMode,
  setChatMode,
  isUploaded,
  setIsUploaded
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [open, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pdfName, setPdfName] = useState("");
  const [pdfFile, setPdfFile] = useState(null);

  const bottomRef = useRef(null);
  const pdfUploadRef = useRef(null);
=======
import { MessageCircleMore ,X, FilePlus, ArrowUp } from "lucide-react";
import { sendPrompt } from "../../services/api";

function ChatSection({ quickActionPrompt, clearQuickAction, theme }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [open, setIsOpen] = useState(false);

  const bottomRef = useRef(null);

  const [loading, setLoading] = useState(false);
>>>>>>> 830d501390e34758e3a2d590f1566d64b97e7e25

  const draggerRef = useRef(null);
  const chatboxRef = useRef(null);

<<<<<<< HEAD

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

=======
  const toggle = () => {
    setIsOpen(!open);
  };

  useEffect(() => {
    let draggable = false;
    const dragger = draggerRef.current;
    if (!dragger) return;

    let rect;

>>>>>>> 830d501390e34758e3a2d590f1566d64b97e7e25
    const pointerDown = () => {
      if (!chatboxRef.current) return;

      draggable = true;
<<<<<<< HEAD

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
=======
      rect = chatboxRef.current.getBoundingClientRect();
      document.body.style.userSelect = "none";
    };
    const pointerMove = (e) => {
      if (draggable && chatboxRef.current) {
        let delta = rect.left - e.clientX;
        let newWidth = Math.max(400, Math.min(840, rect.width + delta));

        chatboxRef.current.style.width = `${newWidth}px`;
      }
    };
    const pointerUp = () => {
      draggable = false;
      document.body.style.userSelect = "";
    };
    dragger.addEventListener("pointerdown", pointerDown);
    document.addEventListener("pointermove", pointerMove);
    document.addEventListener("pointerup", pointerUp);

    return () => {
      dragger.removeEventListener("pointerdown", pointerDown);
      document.removeEventListener("pointermove", pointerMove);
      document.removeEventListener("pointerup", pointerUp);
>>>>>>> 830d501390e34758e3a2d590f1566d64b97e7e25
    };
  }, []);


<<<<<<< HEAD
  /* =========================================================
     SEND MESSAGE
     ========================================================= */

  const sendMessage = async (messageText = input) => {
    if (!messageText || messageText.trim() === "") {
      return;
    }
=======
  const sendMessage = async (messageText = input) => {
    if (messageText.trim() === "") return;
>>>>>>> 830d501390e34758e3a2d590f1566d64b97e7e25

    const userInput = messageText.trim();

    const newMessage = {
      text: userInput,
      sender: "user",
    };

<<<<<<< HEAD
    setMessages((prev) => [
      ...prev,
      newMessage,
    ]);

    setInput("");

=======
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
>>>>>>> 830d501390e34758e3a2d590f1566d64b97e7e25
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
<<<<<<< HEAD
=======

>>>>>>> 830d501390e34758e3a2d590f1566d64b97e7e25
    } catch (error) {
      console.error("FastAPI Error:", error);

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Sorry, I couldn't process your request.",
        },
      ]);
<<<<<<< HEAD
=======

>>>>>>> 830d501390e34758e3a2d590f1566d64b97e7e25
    } finally {
      setLoading(false);
    }
  };
<<<<<<< HEAD


  /* =========================================================
     QUICK ACTION
     ========================================================= */

=======
>>>>>>> 830d501390e34758e3a2d590f1566d64b97e7e25
  useEffect(() => {
    if (quickActionPrompt?.trim()) {
      sendMessage(quickActionPrompt);
      clearQuickAction();
    }
  }, [quickActionPrompt]);

<<<<<<< HEAD

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
        className={`chat-container ${open ? "open" : "close"
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

          <div className="chat-mode">

            {/* Select */}
            <div className="select-wrapper">
              <select value={chatMode} onChange={(e) => setChatMode(e.target.value)}>
                <option value="general">💬 General</option>
                <option value="pdf">📄 PDF</option>
              </select>
              <span className="select-arrow"></span>
            </div>

            {/* Uploaded PDF */}
            {isUploaded && pdfName && (
              <div className="uploaded-pdf">

                <div className="uploaded-pdf-info">
                  <FileText className="pdf-icon" />

                  <span
                    className="pdf-name"
                    title={pdfName}
                  >
                    {pdfName}
                  </span>
                </div>

                <button
                  type="button"
                  className="delete-pdf-btn"
                  onClick={() => {
                    setPdfName("");
                    setIsUploaded(false);

                    if (pdfUploadRef.current) {
                      pdfUploadRef.current.value = "";
                    }
                  }}
                >
                  <X />
                </button>

              </div>
            )}

          </div>  

          <div className="chat-input-row">
            {/* File button */}
            <input type="file" ref={pdfUploadRef} accept=".pdf" style={{ display: 'none' }} onChange={(e) => {
              const file = e.target.files?.[0]
              if (!file) return;
              setPdfFile(file)
              setPdfName(file.name);
              setIsUploaded(true)
            }} />
            <button
              onClick={() => {
                pdfUploadRef.current.click()
              }}
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

=======
  useEffect(() => {
    bottomRef.current?.lastElementChild?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages, loading]);

  return (
    <>
      <button onClick={toggle} className={open ? 'btn-open' : 'btn-close'} style={{ backgroundColor: "transparent", border: "none" }}>
        <MessageCircleMore className={`chat-icon ${theme}`}/>
      </button>
      <div className={`chat-container ${open ? "open" : "close"}`} ref={chatboxRef}>
        <div className="resize-handle" ref={draggerRef} />
        <div className={`chat-X ${open ? "open" : "close"}`}>
          <button onClick={toggle} style={{ backgroundColor: "var(--sidebar-bg)", border: "none" }}>
            <X color="#ffffff" />
          </button>
        </div>
        <div className={`chat-box ${open ? "open" : "close"} `}>
          {/* <button onClick={toggle} className={open?'btn-open':'btn-close'} style={{backgroundColor:"transparent", border:"none"}}>
          <MessageCircleMore color="#ffffff"/>
        </button> */}
          <div ref={bottomRef} className="messages">
            {messages.map((msg, index) => (
              <div key={index} className={`${msg.sender === "user" ? "messageuser" : "messagebot"}`}>
                {msg.text}
              </div>
            ))}
            {
              loading && (
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              )
            }
          </div>

          <div className="chat-input">
            <button>
              <FilePlus />
            </button>
            <textarea
              value={input}
              rows={4}
              wrap="soft"
              // cols={5}
              placeholder="Type a message..."
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
>>>>>>> 830d501390e34758e3a2d590f1566d64b97e7e25
                  sendMessage();
                }
              }}
            />
<<<<<<< HEAD


            {/* Send button */}

            <button
              type="button"
              onClick={() => sendMessage()}
              aria-label="Send message"
            >
=======
            <button onClick={sendMessage}>
>>>>>>> 830d501390e34758e3a2d590f1566d64b97e7e25
              <ArrowUp />
            </button>
          </div>
        </div>
<<<<<<< HEAD

=======
>>>>>>> 830d501390e34758e3a2d590f1566d64b97e7e25
      </div>
    </>
  );
}

export default ChatSection;