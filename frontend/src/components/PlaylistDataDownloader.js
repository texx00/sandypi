import { Component } from 'react';
import { connect } from 'react-redux';

import { getRefreshPlaylists } from '../structure/tabs/playlists/selector';
import { setPlaylists, setRefreshPlaylists } from '../structure/tabs/playlists/Playlists.slice';

import { playlists_request } from '../sockets/SAE';
import { playlists_refresh_response } from '../sockets/SAC';


const mapStateToProps = (state) => {
    return { must_refresh: getRefreshPlaylists(state) }
}

const mapDispatchToProps = (dispatch) => {
    return {
        setPlaylists: (playlists) => dispatch(setPlaylists(playlists)),
        setRefreshFalse: () => dispatch(setRefreshPlaylists(false))
    }
}

class PlaylistDataDownloader extends Component{

    componentDidMount(){
        playlists_refresh_response(this.onDataReceived.bind(this));
        this.requestPlaylists();
    }
    
    requestPlaylists(){
        playlists_request();
    }

    onDataReceived(res){
        this.props.setPlaylists(res.map((el)=>{return JSON.parse(el)}));
    }

    render(){
        if (this.props.must_refresh){
            this.props.setRefreshFalse();
            this.requestPlaylists();
        }
        return null;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(PlaylistDataDownloader);