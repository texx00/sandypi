import React, { Component } from 'react';
import { Button, Container } from 'react-bootstrap';
import { connect } from 'react-redux';

import { drawing_delete, drawing_queue } from '../../../sockets/SAE';

import ConfirmButton from '../../../components/ConfirmButton';

import { static_url } from '../../../project_defaults';

import { getQueueEmpty } from '../queue/selector';
import { getSingleDrawing } from '../drawings/selector';
import { setQueueNotEmpty } from '../queue/Queue.slice';
import { tabBack } from '../Tabs.slice';

const mapStateToProps = (state) => {
    return {
        isQueueEmpty: getQueueEmpty(state),
        element: getSingleDrawing(state)
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        setQueueNotEmpty: () => dispatch(setQueueNotEmpty()),
        handleTabBack: () => dispatch(tabBack())
    }
}

// TODO refine options and layout

class SingleDrawing extends Component{
    
    getImgUrl(){
        return static_url + "/Drawings/" + this.props.element.id + "/" + this.props.element.id + ".jpg";
    }
    
    render(){
        let start_drawing_label = "Queue drawing"
        if (this.props.isQueueEmpty){
            start_drawing_label = "Start drawing"
        }
        return <Container>
            <div>
                <Button onClick={()=>{this.props.handleTabBack()}}>BACK</Button>
                <div>{this.props.element.filename}</div>
            </div>
            <div className="center pb-3">
                <Button className="btn" onClick={()=>{
                    drawing_queue(this.props.element.id);
                }}>
                    {start_drawing_label}
                </Button>
                <Button className="btn">+ Add to playlist</Button>
                <ConfirmButton className="btn" onClick={()=> {
                    drawing_delete(this.props.element.id);
                    //this.props.handleDelete(this.props.element.id);
                }}>Delete drawing</ConfirmButton>
            </div>
            <div className="center mb-5">
                <img className="modal-drawing-preview" src={this.getImgUrl()} alt="Not available"/>
            </div>
        </Container>
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SingleDrawing);