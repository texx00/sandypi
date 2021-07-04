import './Content.scss';

import React, { Component} from 'react';
import { connect } from 'react-redux';
import {Tabs, Tab} from 'react-bootstrap';

import Home from './tabs/Home.js'; 
import Drawings from './tabs/drawings/Drawings';
import Playlists from './tabs/playlists/Playlists';
import ManualControl from './tabs/manual/ManualControl';
import Settings from './tabs/settings/Settings';
import Queue from './tabs/queue/Queue';
import SingleDrawing from './tabs/drawings/SingleDrawing';

import { getTab } from './tabs/selector';
import DrawingDataDownloader from '../components/DrawingDataDownloader';
import PlaylistDataDownloader from '../components/PlaylistDataDownloader';
import SinglePlaylist from './tabs/playlists/SinglePlaylist/SinglePlaylist';
import LedsController from './tabs/leds/Leds';

const mapStateToProps = (state) => {
    return {
        tab: getTab(state)
    }
}

class Content extends Component{
    
    render(){
        return <div className="max-width m-auto text-light pt-3 pb-5 mh100">
            <DrawingDataDownloader />
            <PlaylistDataDownloader />
            
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
                <Tab eventKey="drawing" title="Drawing">
                    <SingleDrawing />
                </Tab>
                <Tab eventKey="playlist" title="Playlist">
                    <SinglePlaylist />
                </Tab>
                <Tab eventKey="leds" title="LEDs">
                    <LedsController />
                </Tab>
            </Tabs>
        </div>
    }
}

export default connect(mapStateToProps)(Content);