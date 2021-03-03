import './SinglePlaylist.scss';

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Row, Col, Modal } from 'react-bootstrap';
import { Play, X } from 'react-bootstrap-icons';

import ConfirmButton from '../../../../components/ConfirmButton';
import SortableElements from '../../../../components/SortableElements';
import IconButton from '../../../../components/IconButton';

import { playlist_delete, playlist_queue, playlist_save } from '../../../../sockets/sEmits';
import { listsAreEqual } from '../../../../utils/dictUtils';

import { resetShowSaveBeforeBack, tabBack } from '../../Tabs.slice';
import { addToPlaylist, deletePlaylist, updateSinglePlaylist } from '../Playlists.slice';
import ControlCard from './ControlCard';

const mapDispatchToProps = (dispatch) => {
    return {
        handleTabBack: () => dispatch(tabBack()),
        deletePlaylist: (id) => dispatch(deletePlaylist(id)),
        updateSinglePlaylist: (pl) => dispatch(updateSinglePlaylist(pl)),
        resetShowSaveBeforeBack: () => dispatch(resetShowSaveBeforeBack()),
        addElements: (elements) => dispatch(addToPlaylist(elements))
    }
}

class SinglePlaylist extends Component{
    constructor(props){
        super(props);
        this.control_card = {element_type: "control_card"}
        this.state = {
            elements: this.addControlCard(this.props.playlist.elements),
            refreshList: false
        }
        this.nameRef = React.createRef();
    }

    addControlCard(elements){
        if (elements !== undefined)
            return [...elements, this.control_card]
        else return [this.control_card]
    }

    save(){
        let orderedEls = this.state.elements.filter((el) => {return el.element_type!=="control_card"});     // remove control card from the end
        console.log(orderedEls)
        let playlist = {
            name: this.nameRef.current.innerHTML,
            elements: orderedEls,
            id: this.props.playlist.id
        };
        if (this.props.playlist.id !== 0){
            this.props.updateSinglePlaylist(playlist);
        }
        playlist_save(playlist);
        console.log("Saving playlist");
    }

    handleSortableUpdate(list){
        if (!listsAreEqual(list, this.state.elements)){                                                     // updates only if the new and old lists are different
            this.setState({...this.state, elements: list, refreshList: true}, this.save.bind(this));        // binding the save function to be used after the state has been set
        }
    }

    componentDidUpdate(){
        if(this.props.shouldUpdateList){
            this.setState({...this.state, elements: this.addControlCard(this.props.playlist.elements), refreshList: true});
            this.props.onListRefreshed();
        }
    }

    handleElementUpdate(element){
        console.log("Handle element")
        console.log(element)
        let res = this.state.elements.map((el) => {return el.id === element.id ? element : el });
        console.log(res)
        this.handleSortableUpdate(res);
    }

    renderElements(){
        if (this.state.elements !== null && 
            this.state.elements !== undefined){
            return <SortableElements
                    list={this.state.elements}
                    onUpdate={this.handleSortableUpdate.bind(this)}
                    refreshList={this.state.refreshList}
                    onListRefreshed={()=>this.setState({...this.state, refreshList: false})}
                    onElementOptionsChange={this.handleElementUpdate.bind(this)}>
                        <ControlCard key={-1} 
                            playlistId={this.props.playlist.id}
                            onElementsAdded={(ids) => {
                                this.save();
                                this.props.addElements({playlistId: this.props.playlist.id, elements: ids});
                            }}/>
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
                        this.props.handleTabBack();
                        this.props.deletePlaylist(this.props.playlist.id);
                    }}>
                    Delete playlist
                </ConfirmButton>
    }

    render(){
        return <Container>
            <div>
                <h1 className="d-inline-block mr-3 text-primary">Playlist name: </h1>
                <h1 className="d-inline-block rounded p-1 editable-title" 
                    onBlur={()=> {
                        if (this.state.playlist !== undefined)
                            if (this.state.playlist.name !== this.nameRef.current.innerHTML) 
                                this.save();
                        }}
                    onFocus={()=>{
                        // select automatically the full text of the playlist name on focus
                        let range = document.createRange();
                        range.selectNodeContents(this.nameRef.current);
                        let sel = window.getSelection();
                        sel.removeAllRanges();
                        sel.addRange(range);
                    }}
                    ref={this.nameRef}
                    title="Click to edit"
                    contentEditable="true" 
                    suppressContentEditableWarning={true}>
                    {this.props.playlist.name}
                </h1>
            </div>
            <Row>
                {this.renderStartButton()}
                {this.renderDeleteButton()}
            </Row>
            {this.renderElements()}

            
            <Modal show={this.props.showResyncModal}
                aria-labelledby="contained-modal-title-vcenter"
                onHide={()=> this.props.onRefreshList()}
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
                    <IconButton onClick={() => this.props.onRefreshList()}>
                        Load the new version
                    </IconButton>
                    <IconButton onClick={()=>{
                            this.save();
                        }}>
                        Save the local changes and overwrite
                    </IconButton>
                </Modal.Footer>
            </Modal>
        </Container>
    }
}

export default connect(null, mapDispatchToProps)(SinglePlaylist);