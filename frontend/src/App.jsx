import './App.css'
import Sidebar from './components/sidebar'
import Navbar from './components/Nav'
import { useState } from 'react';

function App() {
  let [collapsed,setCollapsed] = useState(false)

  return (
    <>
      <Sidebar collapsed={collapsed}></Sidebar>
      
      <Navbar onMenuClick={() => setCollapsed(prev => !prev)}></Navbar>
    
    </>
  )
}

export default App