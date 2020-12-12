import React, { Component } from 'react';
import { Container, Modal } from 'react-bootstrap';
import { connect } from 'react-redux';

import IconButton from '../../../../components/IconButton';
import SinglePlaylist from './SinglePlaylist';

import { getPlaylistResync, getSinglePlaylist } from '../selector';
import { isSinglePlaylist } from '../../selector';
import { setResyncPlaylist } from '../Playlists.slice';

const mapStateToProps = (state) => {
    return {
        playlist: getSinglePlaylist(state),
        playlistRequiresResync: getPlaylistResync(state),
        isSinglePlaylist: isSinglePlaylist(state)
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        resetResync: () => dispatch(setResyncPlaylist(false))
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
        // if is not working on the playlist can reload the page on the background without prompting the modal
        if (this.props.playlistRequiresResync && !this.props.isSinglePlaylist){
            this.refreshPlaylist();
            console.log("prova")
        }
        // if the selected playlist (props) is not the same as the one in the state should update the state
        if (this.state.playlist.id !== this.props.playlist.id){
            this.refreshPlaylist();
            console.log("prova2")
        }
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
                    />
                
                <Modal show={this.props.playlistRequiresResync && this.props.isSinglePlaylist}
                    aria-labelledby="contained-modal-title-vcenter"
                    centered>
                    <Modal.Header className="center">
                        <Modal.Title>
                            The playlist has some changes
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="p-5 center">
                        The playlist has been modified in another window. What do you want to do?
                    </Modal.Body>
                    <Modal.Footer className="center">
                        <IconButton className="center"
                            onClick={this.refreshPlaylist.bind(this)}>
                            Load the new version
                        </IconButton>
                        <IconButton className="center" 
                            onClick={()=>{
                                this.save();
                            }}>
                            Save the local changes and overwrite
                        </IconButton>
                    </Modal.Footer>
                </Modal>
            </Container>
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SinglePlaylistContainer);