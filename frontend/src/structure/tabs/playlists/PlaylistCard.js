import './PlaylistCard.scss';

import React, { Component } from 'react';
import { Card } from 'react-bootstrap';
import { connect } from 'react-redux';

import { showSinglePlaylist } from '../Tabs.slice';

const mapDispatchToProps = (dispatch) => {
    return { showSinglePlaylist: (id) => dispatch(showSinglePlaylist(id))};
}

class PlaylistCard extends Component{

    render(){
        if (this.props.playlist === undefined || this.props.playlist === null)
            return "";
        return <div>
            <Card className="p-2 hover-zoom" onClick={() => this.props.showSinglePlaylist(this.props.playlist.id)}>
            </Card>
        </div>
    }
}

export default connect(null, mapDispatchToProps)(PlaylistCard);