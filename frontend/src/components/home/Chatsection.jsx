import { useState, useRef, useEffect } from "react";
import "./Chatsection.css";
import { PDF_upload, PDF_query, PDF_delete } from "../../helper/PDFConnect"
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
  setIsUploaded,
  setInformer
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [open, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pdfName, setPdfName] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  const bottomRef = useRef(null);
  const pdfUploadRef = useRef(null);

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
      let data
      let botReply
      if (chatMode === 'general') {
        data = await sendPrompt(userInput);
        if (!data.response) {
          throw new Error("Invalid response from server");
        }
        botReply = {
          text: data.response,
          sender: "bot",
        };
      }
      else if (chatMode === 'pdf') {
        data = await PDF_query(userInput);
        if (!data) {
          throw new Error("Invalid response from server");
        }
        botReply = {
          text: data,
          sender: "bot",
        };
      }
      else {
        throw new Error(`Invalid chat mode: ${chatMode}`);
      }

      setMessages((prev) => [
        ...prev,
        botReply,
      ]);
    } catch (error) {
      console.error("FastAPI Error:", error);
      if (chatMode === 'pdf' && pdfFile === null) {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: "Please upload pdf",
          },
        ]);
      }
      else {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: "Sorry, I couldn't process your request.",
          },
        ]);
      }

    } finally {
      setLoading(false);
    }
  };

  const onPdfUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return;
    setUploadingPdf(true);
    try {
      const data = await PDF_upload(file)
      if (data) {
        setIsUploaded(true)
        setChatMode('pdf')
        setPdfFile(file)
        setPdfName(file.name);
        setInformer({
          state: true,
          msg: 'PDF uploaded successfully.'
        })
      }
    }
    catch (error) {
      console.error("PDF upload error:", error);

      setPdfFile(null);
      setPdfName("");
      setIsUploaded(false);
      setChatMode("general");
      if (pdfUploadRef.current) {
        pdfUploadRef.current.value = "";
      }

      setInformer({
        state: true,
        msg: "Failed to upload PDF"
      });
    }
    finally {
      setUploadingPdf(false);
    }
  }

  const onPDFDelete = async () => {
    try {
      setPdfName("");
      setPdfFile(null)
      setIsUploaded(false);
      if (pdfUploadRef.current) {
        pdfUploadRef.current.value = "";
      }
      await PDF_delete()
      setChatMode('general')
      setInformer({
        state: true,
        msg: 'PDF deleted successfully.'
      })
    }
    catch (error) {
      console.error(error)
      setInformer({
        state: true,
        msg: 'failed to delete pdf.'
      })
    }
  }


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
                  onClick={onPDFDelete}
                >
                  <X />
                </button>

              </div>
            )}

          </div>

          <div className="chat-input-row">
            {/* File button */}
            <input type="file" ref={pdfUploadRef} accept=".pdf" style={{ display: 'none' }} onChange={onPdfUpload} />
            <button
              onClick={() => {
                pdfUploadRef.current.click()
              }}
              disabled={uploadingPdf}
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

      </div>
    </>
  );
}

export default ChatSection;
