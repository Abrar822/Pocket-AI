import { useState, useRef, useEffect } from "react";
import "./Chatsection.css";

import { PDF_upload, PDF_query, PDF_delete } from "../../helper/PDFConnect";

import {
  MessageCircleMore,
  X,
  FilePlus,
  ArrowUp,
  FileText,
} from "lucide-react";

import { sendPrompt } from "../../services/api";
import Ack from "../alert/Ack";

const POWER_OPERATIONS = [
  "shutdown",
  "restart",
  "lock",
  "sleep",
  "hibernate",
];

function ChatSection({
  quickActionPrompt,
  clearQuickAction,
  theme,
  chatMode,
  setChatMode,
  isUploaded,
  setIsUploaded,
  setInformer,
  dbModified,
  setDbModified,
  voiceInput,
  setVoiceInput
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [open, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [pdfName, setPdfName] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  const [isPowerOperation, setIsPowerOperation] = useState("");

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

    const pointerDown = (event) => {
      if (!chatboxRef.current) return;

      draggable = true;

      rect = chatboxRef.current.getBoundingClientRect();

      document.body.style.userSelect = "none";

      event.preventDefault();
    };

    const pointerMove = (event) => {
      if (!draggable || !chatboxRef.current) return;

      const delta = rect.left - event.clientX;

      const newWidth = Math.max(
        400,
        Math.min(840, rect.width + delta),
      );

      chatboxRef.current.style.width = `${newWidth}px`;
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

      document.body.style.userSelect = "";
    };
  }, []);

  /* =========================================================
     SEND MESSAGE
     ========================================================= */
  useEffect(() => {
    function voiceMessage() {
      async function exe() {
        if (loading) return
        if (!voiceInput || voiceInput.trim() === "") {
          return;
        }
        const userInput = voiceInput.trim();

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

        const data = await sendPrompt(userInput);
        if (!data.response) {
          throw new Error("Invalid response from server");
        }
        let temp = []
        for (let i = 0; i < data.response.length; i++) {
          if (data.response[i].includes('Folder') || data.response[i].includes('folder')) {
            setDbModified(true)
          }
          temp.push({
            text: data.response[i],
            sender: "bot",
          })
        }
        setMessages((prev) => [
          ...prev,
          ...temp,
        ]);
        setLoading(false);
      }
      exe()

    }
    voiceMessage()
  }, [voiceInput])
  // const sendMessage = async (messageText = input) => {
  //   if (loading) return;

  //   if (!messageText || !messageText.trim()) {
  //     return;
  //   }

  //   const userInput = messageText.trim();

  //   setMessages((prev) => [
  //     ...prev,
  //     {
  //       text: userInput,
  //       sender: "user",
  //     },
  //   ]);

  //   setInput("");
  //   setLoading(true);

  //   try {
  //     let data;

  //     if (chatMode === "general") {
  //       data = await sendPrompt(userInput);

  //       if (!data || !Array.isArray(data.response)) {
  //         throw new Error("Invalid response from server");
  //       }

  //       const botMessages = [];

  //       for (const item of data.response) {
  //         const responseText = String(item);

  //         const normalizedResponse = responseText
  //           .trim()
  //           .toLowerCase();

  //         /*
  //          * Detect an exact power-operation response.
  //          * If detected, show the confirmation popup.
  //          */
  //         if (POWER_OPERATIONS.includes(normalizedResponse)) {
  //           setIsPowerOperation(normalizedResponse);
  //       let temp = []
  //       for (let i = 0; i < data.response.length; i++) {
  //         if (data.response[i].includes('Folder') || data.response[i].includes('folder')) {
  //           setDbModified(true)
  //         }

  //         /*
  //          * Update memory state when folder operations occur.
  //          */
  //         if (
  //           responseText.includes("Folder") ||
  //           responseText.includes("folder")
  //         ) {
  //           setDbModified(true);
  //         }

  //         botMessages.push({
  //           text: responseText,
  //           sender: "bot",
  //         });
  //       }

  //       setMessages((prev) => [...prev, ...botMessages]);
  //     } else if (chatMode === "pdf") {
  //       if (!pdfFile) {
  //         setMessages((prev) => [
  //           ...prev,
  //           {
  //             text: "Please upload a PDF first.",
  //             sender: "bot",
  //           },
  //         ]);

  //         return;
  //       }

  //       data = await PDF_query(userInput);

  //       if (data == null) {
  //         throw new Error("Invalid response from PDF server");
  //       }

  //       setMessages((prev) => [
  //         ...prev,
  //         {
  //           text: typeof data === "string"
  //             ? data
  //             : JSON.stringify(data),
  //           sender: "bot",
  //         },
  //       ]);
  //     } else {
  //       throw new Error(`Invalid chat mode: ${chatMode}`);
  //     }
  //   } catch (error) {
  //     console.error("Chat request error:", error);

  //     setMessages((prev) => [
  //       ...prev,
  //       {
  //         sender: "bot",
  //         text:
  //           chatMode === "pdf" && !pdfFile
  //             ? "Please upload a PDF first."
  //             : "Sorry, I couldn't process your request.",
  //       },
  //     ]);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  
const sendMessage = async (messageText = input) => {
  if (loading) return;

  if (!messageText || !messageText.trim()) return;

  const userInput = messageText.trim();

  setMessages((prev) => [
    ...prev,
    { text: userInput, sender: "user" },
  ]);

  setInput("");
  setLoading(true);

  try {
    let data;

    if (chatMode === "general") {
      data = await sendPrompt(userInput);

      if (!data || !Array.isArray(data.response)) {
        throw new Error("Invalid response from server");
      }

      const botMessages = [];

      for (const item of data.response) {
        const responseText = String(item);
        const normalizedResponse = responseText.trim().toLowerCase();

        // Detect power operations
        if (POWER_OPERATIONS.includes(normalizedResponse)) {
          setIsPowerOperation(normalizedResponse);
        }

        // Detect folder modifications
        if (
          responseText.includes("Folder") ||
          responseText.includes("folder")
        ) {
          setDbModified(true);
        }

        botMessages.push({
          text: responseText,
          sender: "bot",
        });
      }

      setMessages((prev) => [...prev, ...botMessages]);

    } else if (chatMode === "pdf") {

      if (!pdfFile) {
        setMessages((prev) => [
          ...prev,
          {
            text: "Please upload a PDF first.",
            sender: "bot",
          },
        ]);
        return;
      }

      data = await PDF_query(userInput);

      if (data == null) {
        throw new Error("Invalid response from PDF server");
      }

      setMessages((prev) => [
        ...prev,
        {
          text: typeof data === "string"
            ? data
            : JSON.stringify(data),
          sender: "bot",
        },
      ]);

    } else {
      throw new Error(`Invalid chat mode: ${chatMode}`);
    }

  } catch (error) {
    console.error("Chat request error:", error);

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
     PDF UPLOAD
     ========================================================= */

  const onPdfUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setUploadingPdf(true);

    try {
      const data = await PDF_upload(file);

      if (data) {
        setIsUploaded(true);
        setChatMode("pdf");
        setPdfFile(file);
        setPdfName(file.name);

        setInformer({
          state: true,
          msg: "PDF uploaded successfully.",
        });
      }
    } catch (error) {
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
        msg: "Failed to upload PDF.",
      });
    } finally {
      setUploadingPdf(false);
    }
  };

  /* =========================================================
     PDF DELETE
     ========================================================= */

  const onPDFDelete = async () => {
    try {
      await PDF_delete();

      setPdfName("");
      setPdfFile(null);
      setIsUploaded(false);
      setChatMode("general");

      if (pdfUploadRef.current) {
        pdfUploadRef.current.value = "";
      }

      setInformer({
        state: true,
        msg: "PDF deleted successfully.",
      });
    } catch (error) {
      console.error("PDF deletion error:", error);

      setInformer({
        state: true,
        msg: "Failed to delete PDF.",
      });
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
      {/* POWER CONFIRMATION POPUP */}

      {isPowerOperation && (
        <Ack
          isPowerOperation={isPowerOperation}
          setInformer={setInformer}
          setIsPowerOperation={setIsPowerOperation}
        />
      )}

      {/* CHAT OPEN BUTTON */}

      <button
        onClick={toggle}
        className={open ? "btn-open" : "btn-close"}
        style={{
          backgroundColor: "transparent",
          border: "none",
        }}
      >
        <MessageCircleMore className={`chat-icon ${theme}`} />
      </button>

      {/* CHAT CONTAINER */}

      <div
        ref={chatboxRef}
        className={`chat-container ${open ? "open" : "close"} ${theme}`}
      >
        <div
          ref={draggerRef}
          className="resize-handle"
        />

        {/* CLOSE BUTTON */}

        <div className={`chat-X ${theme}`}>
          <button
            onClick={toggle}
            className={`chat-icon-X ${theme}`}
            aria-label="Close chat"
          >
            <X />
          </button>
        </div>

        {/* MESSAGE AREA */}

        <div className={`messages ${theme}`}>
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

          {loading && (
            <div className="typing-indicator">
              <span />
              <span />
              <span />
            </div>
          )}

          <div
            ref={bottomRef}
            className="bottom-anchor"
          />
        </div>

        {/* INPUT AREA */}

        <div className={`chat-input ${theme}`}>
          <div className="chat-mode">
            <div className="select-wrapper">
              <select
                value={chatMode}
                onChange={(event) =>
                  setChatMode(event.target.value)
                }
              >
                <option value="general">💬 General</option>
                <option value="pdf">📄 PDF</option>
              </select>

              <span className="select-arrow" />
            </div>

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
            <input
              type="file"
              ref={pdfUploadRef}
              accept=".pdf"
              style={{ display: "none" }}
              onChange={onPdfUpload}
            />

            <button
              type="button"
              onClick={() => pdfUploadRef.current?.click()}
              disabled={uploadingPdf}
              aria-label="Attach PDF"
            >
              <FilePlus />
            </button>

            <textarea
              className={theme}
              value={input}
              rows={3}
              wrap="soft"
              placeholder="Type a message..."
              onChange={(event) =>
                setInput(event.target.value)
              }
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !event.shiftKey
                ) {
                  event.preventDefault();
                  sendMessage();
                }
              }}
            />

            <button
              type="button"
              onClick={() => sendMessage()}
              aria-label="Send message"
              disabled={loading}
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