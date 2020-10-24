import './App.scss';
import TopBar from './navbars/TopBar.js';
import Footer from './navbars/Footer.js';
import Content from './Content.js';

import {useState} from 'react';

function App() {
  const [tab, setTab] = useState(0);

  function handleTab(tab){
    setTab(tab);
  }

  return (
    <div className="App">
        <TopBar handleTab={handleTab}/>
        <Content selectedTab={tab ? tab : "home"}/>
        <Footer/>
    </div>
  );
}

export default App;
