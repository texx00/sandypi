import './Content.scss';

import React, { Component} from 'react';
import { connect } from 'react-redux';
import {Tabs, Tab} from 'react-bootstrap';

import Home from './tabs/Home.js'; 
import Drawings from './tabs/drawings/Drawings';
import Playlists from './tabs/Playlists';
import ManualControl from './tabs/manual/ManualControl';
import Settings from './tabs/settings/Settings';
import Queue from './tabs/queue/Queue';
import SingleDrawing from './tabs/singleDrawing/SingleDrawing';

import { getTab } from './tabs/selector';

const mapStateToProps = (state) => {
    return {
        tab: getTab(state)
    }
}

class Content extends Component{
    
    render(){
        return <div className="max-width m-auto text-light pt-5 pb-5">
            <Tabs id="content_tabs" className="hide-nav" activeKey={this.props.tab}>
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
                <Tab eventKey="drawing">
                    <SingleDrawing />
                </Tab>
            </Tabs>
        </div>
    }
}

export default connect(mapStateToProps)(Content);