import './SinglePlaylist.scss';

import { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Button, Row, Col } from 'react-bootstrap';

import ConfirmButton from '../../../components/ConfirmButton';

import { playlists_request, playlist_delete, playlist_queue, playlist_save } from '../../../sockets/SAE';

import { tabBack } from '../Tabs.slice';
import { deletePlaylist, updateSinglePlaylist } from './Playlists.slice';
import { getSinglePlaylist } from './selector';

const mapStateToProps = (state) => {
    return { playlist: getSinglePlaylist(state) };
}

const mapDispatchToProps = (dispatch) => {
    return {
        handleTabBack: () => dispatch(tabBack()),
        deletePlaylist: (id) => dispatch(deletePlaylist(id)),
        updateSinglePlaylist: (pl) => dispatch(updateSinglePlaylist(pl))
    }
}

class SinglePlaylist extends Component{
    constructor(props){
        super(props);
        this.state = {
            name: props.playlist.name,
            elements: props.playlist.elements,
            edited: false
        }
    }

    save(){
        let playlist = {
            name: this.state.name,
            elements: this.state.elements,
            id: this.props.playlist.id
        };
        playlist_save(playlist);
        if (this.props.playlist.id === 0){
            this.props.handleTabBack();
            playlists_request()
        }else{
            this.props.updateSinglePlaylist(playlist);
        }
    }

    handleSaveBeforeBack(){
        //TODO check if must save something before going back
        this.props.handleTabBack()
    }

    renderElements(){
        if (this.state.elements !== null && this.state.elements !== undefined)
            return <Row>
                {this.state.elements.map((el) => {
                    return <div>el</div>
                })}
            </Row>
        else return <Row>
            <Col>No element</Col>
        </Row>
    }

    renderStartButton(){
        if (this.props.playlist.id === 0){
            return ""
        }else return <Button onClick={()=>playlist_queue(this.props.playlist.id)}>Start playlist</Button>
    }

    renderDeleteButton(){
        if (this.props.playlist.id === 0)
            return ""
        else
            return <ConfirmButton className="btn" 
                    onClick={()=> {
                        playlist_delete(this.props.playlist.id);
                        this.props.deletePlaylist(this.props.playlist.id);
                        this.props.handleTabBack();}}>
                    Delete playlist
                </ConfirmButton>
    }

    render(){
        return <Container>
            <div>
                <Button onClick={this.handleSaveBeforeBack.bind(this)}>BACK</Button>
                <h1 className="d-inline-block mr-3 text-primary">Playlist name: </h1>
                <h1 className="d-inline-block rounded p-1 editable-title" 
                    title="Click to edit"
                    contentEditable="true" 
                    suppressContentEditableWarning={true}
                    onChange={(evt)=>{
                        this.setState({name: evt.target.value, edited: true});
                    }}>
                    {this.state.name}
                </h1>
            </div>
            <Row>
                {this.renderStartButton()}
                <Col>
                    <Button onClick={this.save.bind(this)}>Save playlist</Button>
                </Col>
                {this.renderDeleteButton()}
            </Row>
            {this.renderElements()}
        </Container>
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SinglePlaylist);