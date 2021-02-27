import React, { Component } from 'react';
import { Col, Modal, OverlayTrigger, Row, Tooltip } from 'react-bootstrap';
import { Alarm, CollectionPlay, Gear, Plus, Shuffle, Upload } from 'react-bootstrap-icons';

import SquareContainer from '../../../../components/SquareContainer';

import UploadDrawingsModal from '../../drawings/UploadDrawing';
import { create_element_drawing, create_element_gcode, create_element_playlist_start, create_element_shuffle, create_element_timing } from '../elementsFactory';

class ControlCard extends Component{
    constructor(props){
        super(props);
        this.state = {
            show_upload: false,
            show_modal: false
        }
        // add new elements here and also in the createElement method switch case
        this.elements = [
            { type: "drawing", icon: <Upload/>,     tip: "Upload a new drawing",            factory: create_element_drawing },
            { type: "command", icon: <Gear/>,       tip: "Add gcode commands",              factory: create_element_gcode },
            { type: "timing",  icon: <Alarm/>,      tip: "Add a delay between drawings",    factory: create_element_timing },
            { type: "shuffle", icon: <Shuffle/>,    tip: "Add a random element",            factory: create_element_shuffle },
            { type: "start_playlist", icon: <CollectionPlay/>, tip: "Start a new playlist", factory: create_element_playlist_start }
        ]
    }

    createElement(type, element_factory){
        // TODO check why it is taking so long to create/add an element
        // TODO if cannot find why it is so slow, can add a "loading" icon
        switch(type){
            case "drawing":
                this.setState({...this.state, show_modal: false, show_upload: true});
                return;
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
        this.setState({...this.state, show_modal: false});
    }

    render(){
        return <Col sm={4} id="control_card" className="nodrag">
                <div className="card hover-zoom rounded clickable">
                    <OverlayTrigger overlay={
                        <Tooltip>
                            Click to add an element to the playlist
                        </Tooltip>}
                        delay={{ show: 3000, hide: 250 }}>
                        <SquareContainer onClick={()=>this.setState({...this.state, show_modal: true})}>
                            <Plus className="w-50 h-50"/>
                        </SquareContainer>
                    </OverlayTrigger>
                </div>

                <Modal show={this.state.show_modal} size="lg" centered onHide={() => this.setState({...this.state, show_modal: false})}>
                    <Modal.Header className="center">
                        <Modal.Title>Create a new element</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Row>
                            {this.elements.map((el, idx) => {
                                return <Col key={idx} className="center">
                                    <OverlayTrigger overlay={
                                        <Tooltip>
                                            {el.tip}
                                        </Tooltip>}
                                        delay={{ show: 1000, hide: 250 }}>
                                        <div className="playlist-control-create clickable p-3 rounded" 
                                            onClick={()=> this.createElement(el.type, el.factory)}>
                                            {el.icon}
                                        </div>
                                    </OverlayTrigger>
                                </Col>
                            })}
                        </Row>
                    </Modal.Body>
                </Modal>

                <UploadDrawingsModal key={2}
                    playlist={this.props.playlistId}
                    show={this.state.show_upload}
                    handleClose={()=>{this.setState({show_upload: false})}}
                    handleFileUploaded={(ids) => {
                        let els = ids.map((id)=>{
                            return create_element_drawing({id: id});
                        })
                        this.props.onElementsAdded(els);
                    }}/>
            </Col>
    }
}

export default ControlCard;