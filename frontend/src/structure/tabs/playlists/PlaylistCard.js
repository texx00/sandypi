import './PlaylistCard.scss';

import React, { Component } from 'react';
import { Card } from 'react-bootstrap';
import { connect } from 'react-redux';

import { showSinglePlaylist } from '../Tabs.slice';
import { setSinglePlaylistId } from './Playlists.slice';

const mapDispatchToProps = (dispatch) => {
    return { showSinglePlaylist: (id) => {
        // can dispatch multiple actions thanks to the "thunk" library
        dispatch(setSinglePlaylistId(id));
        dispatch(showSinglePlaylist(id));
    }};
}

class PlaylistCard extends Component{

    render(){
        if (this.props.playlist === undefined || this.props.playlist === null)
            return "";
        return <div>
            <Card className="p-2 hover-zoom" onClick={() => this.props.showSinglePlaylist(this.props.playlist.id)}>
                <div className="border-0 rounded bg-primary text-dark clickable center p-0">
                    <div className="card-text text-center p-2">{this.props.playlist.name}</div>
                </div>
            </Card>
        </div>
    }
}

export default connect(null, mapDispatchToProps)(PlaylistCard);