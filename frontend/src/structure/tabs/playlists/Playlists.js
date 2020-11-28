import React, { Component } from 'react';
import { connect } from 'react-redux';

import { Section } from '../../../components/Section';
import { showSinglePlaylist } from '../Tabs.slice';

const mapDispatchToProps = (dispatch) => {
    return {
        createNewPlaylist: () => dispatch(showSinglePlaylist(0))
    }
}

class Playlists extends Component{

    createPlaylistHandler(){
        this.props.createNewPlaylist();
    }
    
    render(){
        return <Section sectionTitle="Playlists"
            sectionButton="+ Create new playlist"
            sectionButtonHandler={this.createPlaylistHandler.bind(this)}>
                
        </Section>
    }
}

export default connect(null, mapDispatchToProps)(Playlists);