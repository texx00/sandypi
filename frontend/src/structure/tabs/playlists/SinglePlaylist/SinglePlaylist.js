import './SinglePlaylist.scss';

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Row, Col } from 'react-bootstrap';
import { Play, X } from 'react-bootstrap-icons';

import ConfirmButton from '../../../../components/ConfirmButton';
import SortableElements from '../../../../components/SortableElements';
import IconButton from '../../../../components/IconButton';

import { playlist_delete, playlist_queue, playlist_save } from '../../../../sockets/sEmits';
import { cloneDict, listsAreEqual } from '../../../../utils/dictUtils';

import { tabBack } from '../../Tabs.slice';
import { addToPlaylist, deletePlaylist, resetPlaylistDeletedFlag, resetMandatoryRefresh, updateSinglePlaylist } from '../Playlists.slice';
import ControlCard from './ControlCard';
import { getSinglePlaylist, playlistHasBeenDeleted, singlePlaylistMustRefresh } from '../selector';

const mapStateToProps = (state) => {
    return {
        playlist: getSinglePlaylist(state),
        mandatoryRefresh: singlePlaylistMustRefresh(state),
        playlistDeleted: playlistHasBeenDeleted(state)
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        handleTabBack: () => dispatch(tabBack()),
        deletePlaylist: (id) => dispatch(deletePlaylist(id)),
        updateSinglePlaylist: (pl) => dispatch(updateSinglePlaylist(pl)),
        addElements: (elements) => dispatch(addToPlaylist(elements)),
        resetMandatoryRefresh: () => dispatch(resetMandatoryRefresh()),
        resetPlaylistDeletedFlag: () => dispatch(resetPlaylistDeletedFlag())
    }
}

class SinglePlaylist extends Component{
    constructor(props){
        super(props);
        this.control_card = {element_type: "control_card"}
        this.state = {
            elements: this.addControlCard(this.props.playlist.elements)
        }
        this.nameRef = React.createRef();
    }

    addControlCard(elements){
        if (elements !== undefined){
            elements = this.getFilteredELements(elements);
            return [...elements, this.control_card];
        } else return [this.control_card];
    }

    getFilteredELements(elements){
        if (Array.isArray(elements))
            if (elements.length>0)
                return elements.filter((el) => {return el.element_type!=="control_card"});
        return [];
    }

    save(){
        let orderedEls = this.getFilteredELements(this.state.elements);     // remove control card from the end
        let playlist = {
            name: this.nameRef.current.innerHTML,
            elements: orderedEls,
            id: this.props.playlist.id
        };                                          
        playlist_save(playlist);
        if (this.props.playlist.id !== 0){
            playlist.version = this.props.playlist.version + 1;                                 
            this.props.updateSinglePlaylist(playlist);
        }
        console.log("Saving playlist");
    }

    handleSortableUpdate(list){
        if (!listsAreEqual(list, this.state.elements)){                                                         // updates only if the new and old lists are different
            this.setState({...this.state, elements: this.addControlCard(list)}, this.save.bind(this));          // binding the save function to be used after the state has been set
        }
    }

    componentDidUpdate(){
        if(this.props.shouldUpdateList){
            this.setState({...this.state, elements: this.addControlCard(this.props.playlist.elements)});
        }
    }

    handleElementUpdate(element){
        let res = this.state.elements.map((el) => {return el.id === element.id ? element : el });
        this.handleSortableUpdate(res);
    }

    renderElements(){
        if (this.state.elements !== null && this.state.elements !== undefined){
            return <SortableElements
                    list={this.state.elements}
                    onUpdate={this.handleSortableUpdate.bind(this)}
                    onElementOptionsChange={this.handleElementUpdate.bind(this)}>
                        <ControlCard key={-1} 
                            playlistId={this.props.playlist.id}
                            onElementsAdded={(elements) => {
                                this.setState({...this.state, elements: this.addControlCard([...this.state.elements, ...elements])}, this.save.bind(this));
                            }}/>
                    </SortableElements>
        } else return <Row>
            <Col>No element</Col>
        </Row>
    }

    renderStartButton(){
        if (this.state.elements.length === 0){
            return ""
        }else return <IconButton 
                icon={Play} 
                onClick={()=>playlist_queue(this.props.playlist.id)}>
                Start playlist
            </IconButton>
    }

    renderDeleteButton(){
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

    // TODO add "enter to confirm" event to save the values of the fields in the elements options modals and also the name change
    render(){
        if (this.props.mandatoryRefresh){
            this.setState({...this.state, elements: this.addControlCard(this.props.playlist.elements)});
            this.props.resetMandatoryRefresh()
        }

        if (this.props.playlistHasBeenDeleted){
            this.props.handleTabBack();
        }

        return <Container>
            <div>
                <h1 className="d-inline-block mr-3 text-primary">Playlist name: </h1>
                <h1 className="d-inline-block rounded p-1 editable-title" 
                    onBlur={()=> {
                        if (this.props.playlist.name !== this.nameRef.current.innerHTML) 
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
        </Container>
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SinglePlaylist);