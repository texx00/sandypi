import React, { Component } from 'react';
import { Col, Container, Modal, OverlayTrigger, Row, Tooltip } from 'react-bootstrap';
import { Alarm, Archive, CollectionPlay, Gear, Plus, Shuffle, Upload } from 'react-bootstrap-icons';

import SquareContainer from '../../../../components/SquareContainer';

import UploadDrawingsModal from '../../drawings/UploadDrawing';
import { createElementDrawing, createElementGcode, createElementPlaylistStart, createElementShuffle, createElementTiming } from '../elementsFactory';

class ControlCard extends Component{
    constructor(props){
        super(props);
        this.state = {
            showUpload: false,
            showModal: false
        }
        // add new elements here and also in the createElement method switch case
        this.elements = [
            { type: "drawing_upload", icon: <Upload/>,          tip: "Upload a new drawing",                    label: "Upload drawing",    factory: createElementDrawing },
            { type: "drawing", icon: <Archive/>,                tip: "Select drawing from the uploaded files",  label: "Select drawing",    factory: createElementDrawing },
            { type: "command", icon: <Gear/>,                   tip: "Run gcode commands",                      label: "Add gcode command", factory: createElementGcode },
            { type: "timing",  icon: <Alarm/>,                  tip: "Add a delay between drawings",            label: "Time control",      factory: createElementTiming },
            { type: "shuffle", icon: <Shuffle/>,                tip: "Play random drawing",                     label: "Random drawing",    factory: createElementShuffle },
            { type: "start_playlist", icon: <CollectionPlay/>,  tip: "Start a new playlist",                    label: "Start a playlist",  factory: createElementPlaylistStart }
        ]
    }

    createElement(type, element_factory){
        switch(type){
            case "drawing_upload":
                this.setState({...this.state, showModal: false, showUpload: true});
                return;
            case "drawing":
            case "command":
            case "timing":
            case "shuffle":
            case "start_playlist":
                this.props.onElementsAdded([element_factory(this.props.playlistId)]);
                break;
            default:
                window.show_toast("The type is not supported");
                break;
        }
        this.setState({...this.state, showModal: false});
    }

    render(){
        return <Col sm={4} id="control_card" className="nodrag">
                <div className="card hover-zoom rounded clickable">
                    <OverlayTrigger overlay={
                        <Tooltip>
                            Click to add an element to the playlist
                        </Tooltip>}
                        delay={{ show: 3000, hide: 250 }}>
                        <SquareContainer onClick={()=>this.setState({...this.state, showModal: true})}>
                            <Plus className="w-50 h-50"/>
                        </SquareContainer>
                    </OverlayTrigger>
                </div>

                <Modal show={this.state.showModal} size="lg" centered onHide={() => this.setState({...this.state, showModal: false})}>
                    <Modal.Header className="center">
                        <Modal.Title>Create a new element</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Row>
                            {this.elements.map((el, idx) => {
                                return <Col key={idx} className="center w-100 mb-3" sm={4}>
                                    <OverlayTrigger overlay={
                                        <Tooltip>
                                            {el.tip}
                                        </Tooltip>}
                                        delay={{ show: 1000, hide: 250 }}>
                                        <div className="playlist-control-create clickable p-3 rounded w-100 d-block" 
                                            onClick={()=> this.createElement(el.type, el.factory)}>
                                            <Row><Col className="w-100 center">{el.label}</Col></Row>
                                            <Row className="icon-large center"><Col>{el.icon}</Col></Row>
                                        </div>
                                    </OverlayTrigger>
                                </Col>
                            })}
                        </Row>
                    </Modal.Body>
                </Modal>

                <UploadDrawingsModal key={2}
                    playlist={this.props.playlistId}
                    show={this.state.showUpload}
                    handleClose={()=>{this.setState({showUpload: false})}}
                    handleFileUploaded={(ids) => {
                        let els = ids.map((id)=>{
                            return createElementDrawing({id: id});
                        })
                        this.props.onElementsAdded(els);
                    }}/>
            </Col>
    }
}

export default ControlCard;