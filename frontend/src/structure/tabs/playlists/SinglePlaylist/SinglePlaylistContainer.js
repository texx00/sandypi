import React, { Component } from 'react';
import { Container, Modal } from 'react-bootstrap';
import { connect } from 'react-redux';

import IconButton from '../../../../components/IconButton';
import SinglePlaylist from './SinglePlaylist';

import { getPlaylistResync, getSinglePlaylist } from '../selector';
import { setResyncPlaylist } from '../Playlists.slice';
import { isSinglePlaylist } from '../../selector';

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
        this.state = {playlist: this.props.playlist}
    }

    refreshPlaylist(){
        this.setState({playlist: this.props.playlist});
        this.props.resetResync();
    }

    componentDidUpdate(){
        if (this.props.playlistRequiresResync && !this.props.isSinglePlaylist){
            this.refreshPlaylist();
        }
    }

    render(){
        return <Container>
                <SinglePlaylist playlist={this.state.playlist} resync={this.props.playlist_require_resync}/>;
                
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