import React, { Component } from 'react';
import { Container } from 'react-bootstrap';
import { connect } from 'react-redux';

import SinglePlaylist from './SinglePlaylist';

import { getMandatoryRefresh, getPlaylistResync, getSinglePlaylist, isPlaylistDeleted } from '../selector';
import { isViewSinglePlaylist } from '../../selector';
import { setResyncPlaylist, resetPlaylistDeletedFlag } from '../Playlists.slice';
import { tabBack } from '../../Tabs.slice';

const mapStateToProps = (state) => {
    return {
        playlist: getSinglePlaylist(state),
        playlistRequiresResync: getPlaylistResync(state),
        isViewSinglePlaylist: isViewSinglePlaylist(state),
        isPlaylistDeleted: isPlaylistDeleted(state),
        isMandatoryRefresh: getMandatoryRefresh(state)
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        resetResync: () => dispatch(setResyncPlaylist(false)),
        tabBack: () => dispatch(tabBack()),
        resetPlaylistDeleted: () => dispatch(resetPlaylistDeletedFlag())
    }
}

class SinglePlaylistContainer extends Component{
    constructor(props){
        super(props);
        this.state = {
            playlist: this.props.playlist, 
            refreshedList: false
        }
    }

    refreshPlaylist(){
        this.props.resetResync();
        this.setState({...this.state, playlist: this.props.playlist, refreshedList: true});
    }

    componentDidUpdate(){
        // if the playlist has been deleted, go back to the previous tab
        if (this.props.isPlaylistDeleted && !this.props.playlistRequiresResync && this.props.isViewSinglePlaylist){
            this.props.tabBack();
            this.props.resetPlaylistDeleted();
            return;
        }
        // if is not working on the playlist can reload the page on the background without prompting the modal
        if (this.props.playlistRequiresResync && !this.props.isViewSinglePlaylist){
            this.refreshPlaylist();
        }
        // if the selected playlist (props) is not the same as the one in the state should update the state
        if (this.state.playlist.id !== this.props.playlist.id && !this.props.isViewSinglePlaylist){
            this.refreshPlaylist();
        }

        if (this.props.isMandatoryRefresh)
            this.refreshPlaylist();
    }

    onListRefreshed(){
        this.setState({...this.state, refreshedList: false});
    }

    render(){
        return <Container>
                <SinglePlaylist 
                    playlist={this.state.playlist} 
                    resync={this.props.playlist_require_resync}
                    shouldUpdateList={this.state.refreshedList}
                    onListRefreshed={this.onListRefreshed.bind(this)}
                    onRefreshList={this.refreshPlaylist.bind(this)}
                    showModal={this.props.playlistRequiresResync && this.props.isViewSinglePlaylist}
                    isViewSinglePlaylist={this.props.isViewSinglePlaylist}/>
            </Container>
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SinglePlaylistContainer);