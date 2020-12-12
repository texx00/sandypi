import './SinglePlaylist.scss';

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Row, Col } from 'react-bootstrap';
import { FileEarmarkCheck, Play, X } from 'react-bootstrap-icons';

import ConfirmButton from '../../../../components/ConfirmButton';
import SortableElements from './SortableElements';
import IconButton from '../../../../components/IconButton';

import { playlists_request, playlist_delete, playlist_queue, playlist_save } from '../../../../sockets/SAE';
import { listsAreEqual } from '../../../../utils/dictUtils';

import { tabBack } from '../../Tabs.slice';
import { deletePlaylist, updateSinglePlaylist } from '../Playlists.slice';

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
        this.control_card = {element_type: "control_card"}
        this.state = {
            elements: this.addControlCard(this.props.playlist.elements),
            edited: false
        }
        this.nameRef = React.createRef();
    }

    addControlCard(elements){
        if (elements !== undefined)
            return [...elements, this.control_card]
        else return [this.control_card]
    }

    save(){
        let orderedEls = this.state.elements.filter((el) => {return el.element_type!=="control_card"});   // remove control card from the end
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
            this.setState({...this.state, elements: list, edited: true})
        }
    }

    componentDidUpdate(){
        if(this.props.shouldUpdateList){
            this.setState({...this.state, elements: this.addControlCard(this.props.playlist.elements), edited: false});
            this.props.onListRefreshed();
        }
    }

    renderElements(){
        if (this.state.elements !== null && 
            this.state.elements !== undefined){
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
        }else return <IconButton 
                icon={Play} 
                onClick={()=>playlist_queue(this.props.playlist.id)}>
                Start playlist
            </IconButton>
    }

    renderDeleteButton(){
        if (this.props.playlist.id === 0)
            return ""
        else
            return <ConfirmButton className="btn" 
                    icon={X}
                    onClick={()=> {
                        playlist_delete(this.props.playlist.id);
                        this.props.deletePlaylist(this.props.playlist.id);
                        this.props.handleTabBack();
                    }}>
                    Delete playlist
                </ConfirmButton>
    }

    render(){
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
                    <IconButton icon={FileEarmarkCheck} onClick={this.save.bind(this)}>Save playlist</IconButton>
                </Col>
                {this.renderDeleteButton()}
            </Row>
            {this.renderElements()}

        </Container>
    }
}

export default connect(null, mapDispatchToProps)(SinglePlaylist);