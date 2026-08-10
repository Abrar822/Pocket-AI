import { useState } from 'react'
import './App.css'
import ChatSection from "./components/Chatsectioncopy";
import Orb from "./components/Orb";


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <div style={{position:"absolute", inset:0 ,zIndex:0}}>
      <Orb/>  
    </div>
      <div style={{zIndex:10}}>
        <ChatSection/>
      </div>
    </>
  )
}

export default App