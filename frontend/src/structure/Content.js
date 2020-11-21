import './Content.scss';

import React, { Component} from 'react';
import {Tabs, Tab} from 'react-bootstrap';

import Home from './tabs/Home.js'; 
import Drawings from './tabs/drawings/Drawings';
import Playlists from './tabs/Playlists';
import ManualControl from './tabs/manual/ManualControl';
import Settings from './tabs/settings/Settings';
import Queue from './tabs/queue/Queue';

class Content extends Component{
    
    render(){
        return <div className="max-width m-auto text-light pt-5 pb-5">
            <Tabs id="content_tabs" className="hide-nav" activeKey={this.props.selectedTab}>
                <Tab eventKey="home" title="Home">
                    <Home/>
                </Tab>
                <Tab eventKey="drawings" title="Drawings">
                    <Drawings/>
                </Tab>
                <Tab eventKey="playlists" title="Playlists">
                    <Playlists />
                </Tab>
                <Tab eventKey="manual" title="Manual control">
                    <ManualControl />
                </Tab>
                <Tab eventKey="settings" title="Settings">
                    <Settings />
                </Tab>
                <Tab eventKey="queue" title="Queue">
                    <Queue />
                </Tab>
            </Tabs>
        </div>
    }
}

export default Content;