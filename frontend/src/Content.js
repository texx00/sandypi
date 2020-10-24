import './pages.scss';

import React, { Component} from 'react';
import {Tabs, Tab} from 'react-bootstrap';

import Home from './tabs/Home.js'; 

class Content extends Component{
    
    render(){
        return <div className="max-width m-auto text-light pt-5 pb-5">
            <Tabs id="content_tabs" className="hide-nav" activeKey={this.props.selectedTab}>
                <Tab eventKey="home" title="Home">
                    <Home/>
                </Tab>
                <Tab eventKey="drawings" title="Drawings">
                    drawings
                </Tab>
                <Tab eventKey="playlists" title="Playlists">
                    Playlists
                </Tab>
                <Tab eventKey="manual" title="Manual control">
                    Manual control
                </Tab>
                <Tab eventKey="settings" title="Settings">
                    Settings
                </Tab>
            </Tabs>
        </div>
    }
}

export default Content;