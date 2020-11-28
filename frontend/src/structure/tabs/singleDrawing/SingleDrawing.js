import React, { Component } from 'react';
import { Button, Container } from 'react-bootstrap';
import { connect } from 'react-redux';

import { drawing_delete, drawing_queue } from '../../../sockets/SAE';

import ConfirmButton from '../../../components/ConfirmButton';

import { getImgUrl } from '../../../project_defaults';

import { getQueueEmpty } from '../queue/selector';
import { getSingleDrawing } from '../drawings/selector';
import { setQueueNotEmpty } from '../queue/Queue.slice';
import { tabBack } from '../Tabs.slice';
import { deleteDrawing, setRefreshDrawing } from '../drawings/Drawings.slice';

const mapStateToProps = (state) => {
    return {
        isQueueEmpty: getQueueEmpty(state),
        element: getSingleDrawing(state)
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        setQueueNotEmpty: () => dispatch(setQueueNotEmpty()),
        handleTabBack: () => dispatch(tabBack()),
        refreshDrawings: () => dispatch(setRefreshDrawing()),
        deleteDrawing: (id) => dispatch(deleteDrawing(id))
    }
}

// TODO refine options and layout

class SingleDrawing extends Component{
    
    render(){
        if (this.props.element.id !== undefined){
            let start_drawing_label = "Queue drawing";
            if (this.props.isQueueEmpty){
                start_drawing_label = "Start drawing";
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
                        this.props.deleteDrawing(this.props.element.id);
                        this.props.handleTabBack();
                    }}>Delete drawing</ConfirmButton>
                </div>
                <div className="center mb-5">
                    <img className="modal-drawing-preview" src={getImgUrl(this.props.element.id)} alt="Not available"/>
                </div>
            </Container>
        }else{
            return null;
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SingleDrawing);