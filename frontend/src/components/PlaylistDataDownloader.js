import { Component } from 'react';
import { connect } from 'react-redux';

import { setPlaylists, setSinglePlaylistId, updateSinglePlaylist } from '../structure/tabs/playlists/Playlists.slice';
import { showSinglePlaylist } from '../structure/tabs/Tabs.slice';
import { isShowNewPlaylist } from '../structure/tabs/playlists/selector';

import { playlistsRequest } from '../sockets/sEmits';
import { playlistsRefreshResponse, playlistsRefreshSingleResponse, playlistCreateId } from '../sockets/sCallbacks';


const mapStateToProps = (state) => {
    return {
        showNewPlaylist: isShowNewPlaylist(state)
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        setPlaylists: (playlists) => dispatch(setPlaylists(playlists)),
        refreshSinglePlaylist: (res) => dispatch(updateSinglePlaylist(res)),
        loadNewPlaylist: (pl, showPlaylist) => {
            dispatch(updateSinglePlaylist(pl));
            if (showPlaylist)
                dispatch(setSinglePlaylistId(pl.id)); 
            if (showPlaylist)
                dispatch(showSinglePlaylist(pl.id));
        }
    }
}

class PlaylistDataDownloader extends Component{

    componentDidMount(){
        playlistsRefreshResponse(this.onPlaylistsRefresh.bind(this));
        playlistsRefreshSingleResponse(this.onSinglePlaylistRefresh.bind(this));
        playlistCreateId(this.onPLaylistIdCreated.bind(this));
        this.requestPlaylists();
    }
    
    requestPlaylists(){
        playlistsRequest();
    }

    onPlaylistsRefresh(res){
        this.props.setPlaylists(res.map((el)=>{return JSON.parse(el)}));
    }

    onSinglePlaylistRefresh(res){
        let playlist = JSON.parse(res);
        playlist.elements = JSON.parse(playlist.elements);
        this.props.refreshSinglePlaylist(playlist);
    }

    onPLaylistIdCreated(playlist){
        playlist = JSON.parse(playlist);
        this.props.loadNewPlaylist(playlist, this.props.showNewPlaylist);
    }

    render(){
        return null;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(PlaylistDataDownloader);