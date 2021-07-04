import React, { Component } from 'react';
import { Container, Form, Modal, Row, Col } from 'react-bootstrap';
import { FileEarmarkX, Play, Plus, PlusSquare, X } from 'react-bootstrap-icons';
import { connect } from 'react-redux';

import { drawingDelete, drawingQueue } from '../../../sockets/sEmits';

import ConfirmButton from '../../../components/ConfirmButton';
import IconButton from '../../../components/IconButton';

import { createElementDrawing } from '../playlists/elementsFactory';
import { getImgUrl } from '../../../utils/utils';

import { getQueueCurrent } from '../queue/selector';
import { getSingleDrawing } from './selector';
import { getPlaylistsList } from '../playlists/selector';
import { tabBack } from '../Tabs.slice';
import { deleteDrawing, setRefreshDrawing } from './Drawings.slice';
import { addToPlaylist } from '../playlists/Playlists.slice';
import Image from '../../../components/Image';


const mapStateToProps = (state) => {
    return {
        currentElement: getQueueCurrent(state),
        drawing:        getSingleDrawing(state),
        playlists:      getPlaylistsList(state)
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        handleTabBack:          () => dispatch(tabBack()),
        refreshDrawings:        () => dispatch(setRefreshDrawing()),
        deleteDrawing:        (id) => dispatch(deleteDrawing(id)),
        addToPlaylist:    (bundle) => dispatch(addToPlaylist(bundle))
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
            return <IconButton className="btn w-100 center"
                icon={PlusSquare}
                onClick={() => this.setState({...this.state, showPlaylists: true})}>
                Add to playlist
            </IconButton>
        }else return "";
    }
    
    render(){
        if (this.props.drawing.id !== undefined){
            let startDrawingLabel = "Queue drawing";
            if (this.props.currentElement === undefined){
                startDrawingLabel = "Start drawing";
            }
            // TODO add possibility to edit the gcode file and render again the drawing
            return <Container>
                <div className="mb-3 w-100 center">
                    <h1 className="d-inline-block ml-3">{this.props.drawing.filename}</h1>
                </div>
                <Row className="center pb-3">
                    <Col sm={4} className="center">
                        <IconButton className="btn w-100 center" 
                            icon={Play}
                            onClick={()=>{
                                drawingQueue(this.props.drawing.id);
                                this.props.handleTabBack();
                        }}>
                            {startDrawingLabel}
                        </IconButton>
                    </Col>
                    <Col sm={4} className="center">
                        {this.renderAddToPlaylistButton()}
                    </Col>
                    <Col sm={4} className="center">
                        <ConfirmButton className="w-100 center" 
                            icon={FileEarmarkX}
                            onClick={()=> {
                                drawingDelete(this.props.drawing.id);
                                this.props.deleteDrawing(this.props.drawing.id);
                                this.props.handleTabBack();
                        }}>
                            Delete drawing
                        </ConfirmButton>
                    </Col>
                </Row>
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
                                window.showToast("Drawing added to the playlist");
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