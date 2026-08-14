  import { useState,useRef,useEffect } from "react";
import "./Chatsectioncopy.css";
import {MessageCircleMore} from "lucide-react";
import {X} from "lucide-react";

function ChatSection() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [open,setIsOpen] = useState(false);
  const bottomRef = useRef(null);
  
  const sendMessage = () => {
    if (input.trim() === "") return;

    const newMessage = {
      text: input,
      sender: "user"
    };
    const botreplay = {
      text:"This is a replay",
      sender:"bot"
    }

    setMessages([...messages, newMessage, botreplay]);
    setInput("");
  };
  const toggle = () => {
    setIsOpen(!open);
  };
  useEffect(() => {
  bottomRef.current?.lastElementChild?.scrollIntoView({
    behavior: "smooth"
  });
}, [messages]);
  

  return (
    <div className="chat-container">
       <button onClick={toggle} className={open?'btn-open':'btn-close'} style={{backgroundColor:"transparent", border:"none"}}>
          <MessageCircleMore className="chat-icon" color="#ffffff"/>
        </button>
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
        </div>
      
      <div className="chat-input">
        <input
          type="text"
          value={input}
          placeholder="Type a message..."
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
            sendMessage();
          }}}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
      </div>
    </div>
  );
}

export default ChatSection;
