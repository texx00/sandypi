import './SinglePlaylist.scss';

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Button, Row, Col, Modal } from 'react-bootstrap';

import ConfirmButton from '../../../../components/ConfirmButton';
import SortableElements from './SortableElements';
import IconButton from '../../../../components/IconButton';

import { playlists_request, playlist_delete, playlist_queue, playlist_save } from '../../../../sockets/SAE';
import { listsAreEqual } from '../../../../utils/dictUtils';

import { tabBack } from '../../Tabs.slice';
import { deletePlaylist, updateSinglePlaylist } from '../Playlists.slice';
import { getSinglePlaylist } from '../selector';

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
            ordered_elements: this.addControlCard(props.playlist.elements),
            edited: false
        }
        this.nameRef = React.createRef();
    }

    addControlCard(elements){
        return [...elements, {element_type: "control_card"}]
    }

    save(){
        let orderedEls = this.state.ordered_elements.filter((el) => {return el.element_type!=="control_card"});   // remove control card from the end
        let playlist = {
            name: this.nameRef.current.innerHTML,
            elements: orderedEls,
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

    handleSortableUpdate(list){
        if (!listsAreEqual(list, this.state.elements)){
            this.setState({ordered_elements: list})
        }
    }    

    renderElements(askSync){
        if (this.state.ordered_elements !== null && 
            this.state.ordered_elements !== undefined &&
            !askSync){
            return <SortableElements
                    list={this.state.ordered_elements}
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
        let askSync = false;
        if (!listsAreEqual(this.state.elements, this.props.playlist.elements))   // compare local elements with remote elements
            askSync = true;                 // if the redux playlist elements are different from the one in this tab means somebody else changed them and they must be resyncronized
        askSync = false         // TODO not working correctly
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
            {this.renderElements(askSync)}

            <Modal show={askSync}
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
                        onClick={()=>{
                            this.setState({elements: this.props.playlist.elements});
                        }}>
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

export default connect(mapStateToProps, mapDispatchToProps)(SinglePlaylist);