import React, { Component } from 'react';

import Section from '../../components/Section';

class Playlists extends Component{

    createPlaylistHandler(){

    }
    
    render(){
        return <Section sectionTitle="Playlists"
            sectionButton="+ Create new playlist"
            sectionButtonHandler={this.createPlaylistHandler.bind(this)}>
                Playlists
        </Section>
    }
}

export default Playlists;