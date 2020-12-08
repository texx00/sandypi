import React, { Component } from 'react';
import { Container, Form, Modal } from 'react-bootstrap';
import { FileEarmarkX, Play, Plus, PlusSquare, X } from 'react-bootstrap-icons';
import { connect } from 'react-redux';

import { drawing_delete, drawing_queue } from '../../../sockets/SAE';

import ConfirmButton from '../../../components/ConfirmButton';
import IconButton from '../../../components/IconButton';

import { create_drawing_element } from '../playlists/elements';
import { getImgUrl } from '../../../utils/utils';

import { getQueueEmpty } from '../queue/selector';
import { getSingleDrawing } from './selector';
import { getPlaylistsList } from '../playlists/selector';
import { setQueueNotEmpty } from '../queue/Queue.slice';
import { tabBack } from '../Tabs.slice';
import { deleteDrawing, setRefreshDrawing } from './Drawings.slice';
import { addToPlaylist } from '../playlists/Playlists.slice';


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

// TODO refine options and layout

class SingleDrawing extends Component{
    constructor(props){
        super(props);
        this.state = {
            showPlaylists: false
        };
        this.selectRef = React.createRef();
    }
    
    render(){
        if (this.props.drawing.id !== undefined){
            let start_drawing_label = "Queue drawing";
            if (this.props.isQueueEmpty){
                start_drawing_label = "Start drawing";
            }
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
                    <IconButton className="btn"
                        icon={PlusSquare}
                        onClick={() => this.setState({showPlaylists: true})}>
                        Add to playlist
                    </IconButton>
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
                    <img className="modal-drawing-preview" src={getImgUrl(this.props.drawing.id)} alt="Not available"/>
                </div>
                <Modal show={this.state.showPlaylists}
                    onHide={() => this.setState({showPlaylists: false})}
                    aria-labelledby="contained-modal-title-vcenter"
                    centered>
                    <Modal.Header>
                        <Modal.Title>
                            Choose a playlist
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="p-5">
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
                        <IconButton icon={X} onClick={() => this.setState({showPlaylists: false})}>Undo</IconButton>
                        <IconButton icon={Plus} 
                            onClick={() => {this.props.addToPlaylist({
                                    element: create_drawing_element(this.props.drawing),
                                    playlistId: parseInt(this.selectRef.current.value)
                                });
                                this.setState({showPlaylists: false});
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