import './App.scss';

import TopBar from './structure/TopBar.js';
import Footer from './structure/Footer.js';
import Content from './structure/Content.js';
import Toasts from './structure/Toasts';

import {check_software_updates} from "./utils/SWUpdates";

import {useState, useEffect} from 'react';

function App() {
  const [tab, setTab] = useState("home");

  useEffect(()=>{
    check_software_updates();     // check for updates when the app is ready
  })

  function handleTab(tab){
    setTab(tab);
  }

  return (
    <div className="App">
        <TopBar handleTab={handleTab}/>
        <Content selectedTab={tab}/>
        <Footer/>
        <Toasts/>
    </div>
  );
}

export default App;
