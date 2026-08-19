import { useState,useRef,useEffect } from "react";
import "./Chatsection.css";
import {MessageCircleMore} from "lucide-react";
import {X} from "lucide-react";
import {fastapiConnect} from "../../helper/FastapiConnect"

function ChatSection() {
  const [messages, setMessages] = useState([
    {
      sender:"bot",
      text: "Hi, I am Pocket AI. How can I help you?",
    },
  ]);
  const [input, setInput] = useState("");
  const [open,setIsOpen] = useState(false);
  const bottomRef = useRef(null);
  const [chatWidth, setChatWidth] = useState(400);
  const isResizing = useRef(false);
  const [loading, setLoading] = useState(false);

  const startResize = (e) => {
    isResizing.current = true;

    document.addEventListener("mousemove", resize);
    document.addEventListener("mouseup", stopResize);
  };

  const resize = (e) => {
    if (!isResizing.current) return;

    const newWidth = window.innerWidth - e.clientX;

    // minimum and maximum width
    if (newWidth >= 300 && newWidth <= 700) {
      setChatWidth(newWidth);
    }
  };

  const stopResize = () => {
    isResizing.current = false;

    document.removeEventListener("mousemove", resize);
    document.removeEventListener("mouseup", stopResize);
  };
  
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
          <MessageCircleMore className="chat-icon" color="#ffffff"/>
    </button>
    <div className={`chat-container ${open?"open":"close"}`} style={{width:`${chatWidth}px`}}>
        <div className="resize-handle" onMouseDown={startResize}/>
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
        <button onClick={sendMessage}>Send</button>
      </div>
      </div>
    </div>
    </>
  );
}

export default ChatSection;
