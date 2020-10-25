import './DrawingCard.scss';

import React, { Component } from 'react';
import { Button, Card, Modal } from 'react-bootstrap';

import {static_url} from '../../../project_defaults';

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
                        <Button className="btn">Draw it now/add to queue</Button>
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

export default DrawingCard;