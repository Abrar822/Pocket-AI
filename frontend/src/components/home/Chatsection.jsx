import { useState,useRef,useEffect } from "react";
import "./Chatsection.css";
import {MessageCircleMore,X,FilePlus,ArrowUp} from "lucide-react";
import {fastapiConnect} from "../../helper/FastapiConnect"

function ChatSection({theme}) {
  const [messages, setMessages] = useState([
    {
      sender:"bot",
      text: "Hi, I am Pocket AI. How can I help you?",
    },
  ]);
  const [input, setInput] = useState("");
  const [open,setIsOpen] = useState(false);
  const bottomRef = useRef(null);

  const [loading, setLoading] = useState(false);

  const draggerRef = useRef(null);
  const chatboxRef = useRef(null);

  useEffect(() => {
      let draggable = false;
      const dragger = draggerRef.current;
      if (!dragger) return;
  
      let rect;
  
      const pointerDown = () => {
        if (!chatboxRef.current) return;
  
        draggable = true;
        rect = chatboxRef.current.getBoundingClientRect();
        document.body.style.userSelect = "none";
      };
      const pointerMove = (e) => {
        if (draggable && chatboxRef.current) {
          let delta = rect.left - e.clientX;
          let newWidth = Math.max(400, Math.min(900, rect.width + delta));
  
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
      };
    }, []);
  
  
  const sendMessage = async () => {
    if (input.trim() === "") return;
    const userInput = input.trim();
    const newMessage = {
      text: userInput,
      sender: "user"
    };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setLoading(true);
    try {
      let data = await fastapiConnect(userInput);
      const botreplay = {
        text:data['response'],
        sender:"bot"
      }
      setMessages((prev) => [...prev, botreplay]);
    } catch(error) {
      console.error("FastAPI Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Sorry, I couldn't process your request.",
        },
      ]);
    } finally {
      setLoading(false)
    }
    
  };
  const toggle = () => {
    setIsOpen(!open);
  };
  useEffect(() => {
  bottomRef.current?.lastElementChild?.scrollIntoView({
    behavior: "smooth"
  });
}, [messages,loading]);
  

  return (
    <>
    <button onClick={toggle} className={open?'btn-open':'btn-close'} style={{backgroundColor:"transparent", border:"none"}}>
          <MessageCircleMore className={`chat-icon ${theme}`}/>
    </button>
    <div className={`chat-container ${open?"open":"close"}`} ref={chatboxRef}>
        <div className="resize-handle" ref={draggerRef}/>
        <div className={`chat-X ${open?"open":"close"}`}>
          <button onClick={toggle} style={{backgroundColor:"transparent", border:"none"}}>
              <X color="#ffffff"/>
        </button>
        </div>
        <div className={`chat-box ${open?"open":"close"} `}>
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
          <FilePlus/>
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
              sendMessage();
          }}}
        />
        <button onClick={sendMessage}>
          <ArrowUp/>
        </button>
      </div>
      </div>
    </div>
    </>
  );
}

export default ChatSection;