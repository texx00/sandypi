import React, { Component } from 'react';
import { Container, Form, Modal } from 'react-bootstrap';
import { FileEarmarkX, Play, Plus, PlusSquare, X } from 'react-bootstrap-icons';
import { connect } from 'react-redux';

import { drawing_delete, drawing_queue } from '../../../sockets/sEmits';

import ConfirmButton from '../../../components/ConfirmButton';
import IconButton from '../../../components/IconButton';

import { createElementDrawing } from '../playlists/elementsFactory';
import { getImgUrl } from '../../../utils/utils';

import { getQueueEmpty } from '../queue/selector';
import { getSingleDrawing } from './selector';
import { getPlaylistsList } from '../playlists/selector';
import { setQueueNotEmpty } from '../queue/Queue.slice';
import { tabBack } from '../Tabs.slice';
import { deleteDrawing, setRefreshDrawing } from './Drawings.slice';
import { addToPlaylist } from '../playlists/Playlists.slice';
import Image from '../../../components/Image';


const mapStateToProps = (state) => {
    return {
        isQueueEmpty: getQueueEmpty(state),
        drawing: getSingleDrawing(state),
        playlists: getPlaylistsList(state)
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        setQueueNotEmpty: () => dispatch(setQueueNotEmpty()),
        handleTabBack: () => dispatch(tabBack()),
        refreshDrawings: () => dispatch(setRefreshDrawing()),
        deleteDrawing: (id) => dispatch(deleteDrawing(id)),
        addToPlaylist: (bundle) => dispatch(addToPlaylist(bundle))
    }
}

class SingleDrawing extends Component{
    constructor(props){
        super(props);
        this.state = {
            showPlaylists: false
        };
        this.selectRef = React.createRef();
    }

    renderAddToPlaylistButton(){
        if (this.props.playlists.length > 0){
            return <IconButton className="btn"
                icon={PlusSquare}
                onClick={() => this.setState({...this.state, showPlaylists: true})}>
                Add to playlist
            </IconButton>
        }else return "";
    }
    
    render(){
        if (this.props.drawing.id !== undefined){
            let start_drawing_label = "Queue drawing";
            if (this.props.isQueueEmpty){
                start_drawing_label = "Start drawing";
            }
            // TODO add possibility to edit the gcode file and render again the drawing
            return <Container>
                <div className="mb-3 w-100 center">
                    <h1 className="d-inline-block ml-3">{this.props.drawing.filename}</h1>
                </div>
                <div className="center pb-3">
                    <IconButton className="btn" 
                        icon={Play}
                        onClick={()=>{
                            drawing_queue(this.props.drawing.id);
                    }}>
                        {start_drawing_label}
                    </IconButton>
                    {this.renderAddToPlaylistButton()}
                    <ConfirmButton className="btn" 
                        icon={FileEarmarkX}
                        onClick={()=> {
                            drawing_delete(this.props.drawing.id);
                            this.props.deleteDrawing(this.props.drawing.id);
                            this.props.handleTabBack();
                    }}>
                        Delete drawing
                    </ConfirmButton>
                </div>
                <div className="center mb-5">
                    <Image className="modal-drawing-preview" src={getImgUrl(this.props.drawing.id)} alt="Drawing image"/>
                </div>
                <Modal show={this.state.showPlaylists}
                    onHide={() => this.setState({...this.state, showPlaylists: false})}
                    aria-labelledby="contained-modal-title-vcenter"
                    centered>
                    <Modal.Header className="center">
                        <Modal.Title>
                            Choose a playlist
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="p-5 center">
                        <Form>
                            <Form.Group>
                                <Form.Control as="select" ref={this.selectRef}>
                                    {this.props.playlists.map((el, idx) => {
                                        return <option key={idx} value={el.id}>{el.name}</option>
                                    })}
                                </Form.Control>
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <IconButton icon={X} onClick={() => this.setState({...this.state, showPlaylists: false})}>Undo</IconButton>
                        <IconButton icon={Plus} 
                            onClick={() => {this.props.addToPlaylist({
                                    elements: [createElementDrawing(this.props.drawing)],
                                    playlistId: parseInt(this.selectRef.current.value)
                                });
                                this.setState({...this.state, showPlaylists: false});
                                window.show_toast("Drawing added to the playlist");
                            }}>
                                Add to selected playlist
                        </IconButton>
                    </Modal.Footer>
                </Modal>
            </Container>
        }else return null;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SingleDrawing);