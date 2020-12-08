import './SinglePlaylist.scss';

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Button, Row, Col } from 'react-bootstrap';

import ConfirmButton from '../../../../components/ConfirmButton';

import { playlists_request, playlist_delete, playlist_queue, playlist_save } from '../../../../sockets/SAE';

import { tabBack } from '../../Tabs.slice';
import { deletePlaylist, updateSinglePlaylist } from '../Playlists.slice';
import { getSinglePlaylist } from '../selector';
import SortableElements from './SortableElements';

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
            elements: props.playlist.elements,
            edited: false
        }
        this.nameRef = React.createRef();
    }

    save(){
        let playlist = {
            name: this.nameRef.current.innerHTML,
            elements: this.state.elements,
            id: this.props.playlist.id
        };
        // TODO save new elements order
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

    handleSortableUpdate(event){
        //TODO handle this
    }    

    renderElements(){
        if (this.state.elements !== null && this.state.elements !== undefined){
            return <SortableElements
                    list={this.state.elements}
                    onUpdate={this.handleSortableUpdate.bind(this)}>
                </SortableElements>
        } else return <Row>
            <Col>No element</Col>
        </Row>
    }

    renderStartButton(){
        if (this.props.playlist.id === 0 || this.state.elements.length === 0){
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
        if (this.state.elements !== this.props.playlist.elements){
            if (this.state.edited){
                //TODO show a popup to tell the user that some change has been done in the background
            }else{
                this.setState({elements: this.props.playlist.elements});
            }
            
        }
        return <Container>
            <div>
                <h1 className="d-inline-block mr-3 text-primary">Playlist name: </h1>
                <h1 className="d-inline-block rounded p-1 editable-title" 
                    ref={this.nameRef}
                    title="Click to edit"
                    contentEditable="true" 
                    suppressContentEditableWarning={true}>
                    {this.props.playlist.name}
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