import './DrawingCard.scss';

import React, { Component } from 'react';
import { Button, Card, Modal } from 'react-bootstrap';
import { connect } from 'react-redux';

import { static_url } from '../../../project_defaults';
import { drawing_queue } from '../../../sockets/SAE';

import { getQueueEmpty } from '../queue/selector';
import { setQueueNotEmpty } from '../queue/Queue.slice';

const mapStateToProps = (state) => {
    return {
        isQueueEmpty: getQueueEmpty(state)
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        setQueueNotEmpty: () => dispatch(setQueueNotEmpty()),
    }
}

class DrawingCard extends Component{
    constructor(props){
        super(props);
        this.state = {show_details: false};
    }

    getImgUrl(){
        return static_url + "/Drawings/" + this.props.element.id + "/" + this.props.element.id + ".jpg";
    }
    // TODO drawing options

    render(){
        let start_drawing_label = "Queue drawing"
        if (this.props.isQueueEmpty){
            start_drawing_label = "Start drawing"
        }
        return <div>
            <Card className="p-2 hover-zoom" onClick={()=>this.setState({show_details: true})}>
                <div className="border-0 bg-black rounded text-dark clickable center p-0">
                    <img className="card-img-top rounded" src={this.getImgUrl()} alt="Not available"/>
                    <div className="card-img-overlay h-100 d-flex flex-column justify-content-end p-2">
                        <div className="card-text text-center text-dark p-1 fade-top"></div>
                        <div className="card-text text-center text-dark pb-1 bg-primary rounded-bottom">
                            {this.props.element.filename}
                        </div>
                    </div>
                </div>
            </Card>
            <Modal show={this.state.show_details} 
                onHide={() => this.setState({show_details: false})}
                size="lg"
                centered>
                <Modal.Header closeButton>
                    <Modal.Title >{this.props.element.filename}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="center pb-3">
                        <Button className="btn" onClick={()=>{
                            drawing_queue(this.props.element.id);
                        }}>
                            {start_drawing_label}
                        </Button>
                        <Button className="btn">+ Add to playlist</Button>
                        <Button className="btn">Delete drawing</Button>
                    </div>
                    <div className="center mb-5">
                        <img className="modal-drawing-preview" src={this.getImgUrl()} alt="Not available"/>
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(DrawingCard);