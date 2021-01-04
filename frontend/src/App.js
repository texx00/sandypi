import './App.scss';


import TopBar from './structure/TopBar.js';
import Footer from './structure/Footer.js';
import Content from './structure/Content.js';
import Toasts from './structure/Toasts';
import SWUpdates from './structure/SWUpdates';

function App() {
  return (
    <div className="App">
        <SWUpdates />
        <TopBar/>
        <Content/>
        <Footer/>
        <Toasts/>
    </div>
  );
}

export default App;
