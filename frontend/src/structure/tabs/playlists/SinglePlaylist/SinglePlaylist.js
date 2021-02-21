import './SinglePlaylist.scss';

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Row, Col, Modal } from 'react-bootstrap';
import { FileEarmarkCheck, Play, X, Check } from 'react-bootstrap-icons';

import ConfirmButton from '../../../../components/ConfirmButton';
import SortableElements from '../../../../components/SortableElements';
import IconButton from '../../../../components/IconButton';

import { playlist_delete, playlist_queue, playlist_save } from '../../../../sockets/sEmits';
import { listsAreEqual } from '../../../../utils/dictUtils';

import { resetShowSaveBeforeBack, setSaveBeforeBack, tabBack } from '../../Tabs.slice';
import { addToPlaylist, deletePlaylist, updateSinglePlaylist } from '../Playlists.slice';
import { getShowSaveBeforeBack } from '../../selector';
import ControlCard from './ControlCard';

const mapStateToProps = (state) => {
    return {
        is_save_before_back: getShowSaveBeforeBack(state)
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        handleTabBack: () => dispatch(tabBack()),
        deletePlaylist: (id) => dispatch(deletePlaylist(id)),
        updateSinglePlaylist: (pl) => dispatch(updateSinglePlaylist(pl)),
        saveBeforeBack: () => dispatch(setSaveBeforeBack(true)),
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
            edited: false,
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
        let orderedEls = this.state.elements.filter((el) => {return el.element_type!=="control_card"});   // remove control card from the end
        let playlist = {
            name: this.nameRef.current.innerHTML,
            elements: orderedEls,
            id: this.props.playlist.id
        };
        this.props.resetShowSaveBeforeBack();
        if (this.props.playlist.id === 0){
            this.props.handleTabBack();
            playlist_save(playlist);
        }else{
            this.props.updateSinglePlaylist(playlist);
        }
        window.show_toast(<div>Playlist saved <Check /></div>);
    }

    handleSaveBeforeBack(){
        this.props.saveBeforeBack();
    }

    handleSortableUpdate(list){
        if (!listsAreEqual(list, this.state.elements)){                     // updates only if the new and old lists are different
            this.setState({...this.state, elements: list, edited: true, refreshList: true});
            this.handleSaveBeforeBack();
        }
    }

    componentDidUpdate(){
        if(this.props.shouldUpdateList){
            this.setState({...this.state, elements: this.addControlCard(this.props.playlist.elements), edited: false, refreshList: true});
            this.props.onListRefreshed();
        }
    }

    handleElementUpdate(element){
        let tmp = this.state.elements.map((el) => {return el});
        let res = tmp.map((el)=>{
            if (el.id === element.id)
                return element;
            else return el;
        });
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
                            onElementsAdded={(ids) => this.props.addElements({playlistId: this.props.playlist.id, elements: ids})}/>
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
                    onBlur={()=> {
                        if (this.state.playlist !== undefined)
                            if (this.state.playlist.name !== this.nameRef.current.innerHTML) 
                                this.handleSaveBeforeBack();
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
                <Col>
                    <IconButton icon={FileEarmarkCheck} onClick={this.save.bind(this)}>Save playlist</IconButton>
                </Col>
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

            <Modal show={this.props.is_save_before_back && this.props.isViewSinglePlaylist}
                aria-labelledby="contained-modal-title-vcenter"
                centered
                onHide={()=>{this.props.resetShowSaveBeforeBack(); 
                    this.handleSaveBeforeBack()}}>
                <Modal.Header className="center">
                    <Modal.Title>
                        Save playlist changes?
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-5 center">
                    The playlist have some unsaved changes, are you sure you want to go back?
                </Modal.Body>
                <Modal.Footer className="center">
                    <IconButton onClick={()=>{
                            this.save();
                        }}>
                        Save
                    </IconButton>
                    <IconButton onClick={()=>{
                            this.props.resetShowSaveBeforeBack();
                            this.handleSaveBeforeBack();
                        }}>
                        Undo
                    </IconButton>
                    <IconButton onClick={()=>{
                            this.props.resetShowSaveBeforeBack();
                            this.props.handleTabBack();
                        }}>
                        Do not save and go back
                    </IconButton>
                </Modal.Footer>
            </Modal>
        </Container>
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SinglePlaylist);