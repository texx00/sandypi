import './App.scss';

import TopBar from './structure/TopBar.js';
import Footer from './structure/Footer.js';
import Content from './structure/Content.js';
import Toasts from './structure/Toasts';

import {useState} from 'react';

function App() {
  const [tab, setTab] = useState("home");

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
