import './App.css'
import Sidebar from './components/sidebar'
import Navbar from './components/Nav'
import { useState } from 'react';
import ChatSection from "./components/Chatsectioncopy";
import Orb from "./components/Orb";

function App() {
  let [collapsed,setCollapsed] = useState(true)

  return (
    <div className='app'>
      <Sidebar collapsed={collapsed}></Sidebar>
      
      <Navbar onMenuClick={() => setCollapsed(prev => !prev)}></Navbar>

      <main className="main-content">

                <div className="orb-container">
                    <Orb
                        size={300}
                        state="listening"
                    />
                </div>

                <div className="chat-container-wrapper">
                    <ChatSection />
                </div>

      </main>
    
    </div>
  )
}

export default App