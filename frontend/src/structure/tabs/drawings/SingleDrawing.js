import React, { Component } from 'react';
import { Button, Container } from 'react-bootstrap';
import { FileEarmarkX, Play, PlusSquare } from 'react-bootstrap-icons';
import { connect } from 'react-redux';

import { drawing_delete, drawing_queue } from '../../../sockets/SAE';

import ConfirmButton from '../../../components/ConfirmButton';

import { getImgUrl } from '../../../utils/utils';

import { getQueueEmpty } from '../queue/selector';
import { getSingleDrawing } from './selector';
import { setQueueNotEmpty } from '../queue/Queue.slice';
import { tabBack } from '../Tabs.slice';
import { deleteDrawing, setRefreshDrawing } from './Drawings.slice';

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
                <div className="mb-3 w-100 center">
                    <h1 className="d-inline-block ml-3">{this.props.element.filename}</h1>
                </div>
                <div className="center pb-3">
                    <Button className="btn" onClick={()=>{
                        drawing_queue(this.props.element.id);
                    }}>
                        <div className="d-flex">
                                <Play className="mr-1 align-self-center"/>
                                <span className="align-self-center">{start_drawing_label}</span>
                            </div>
                    </Button>
                    <Button className="btn"><div className="d-flex">
                                <PlusSquare className="mr-2 align-self-center"/>
                                <span className="align-self-center">Add to playlist</span>
                            </div></Button>
                    <ConfirmButton className="btn" onClick={()=> {
                        drawing_delete(this.props.element.id);
                        this.props.deleteDrawing(this.props.element.id);
                        this.props.handleTabBack();
                    }}>
                        <div className="d-flex">
                            <FileEarmarkX className="mr-2 align-self-center"/>
                            <span className="align-self-center">Delete drawing</span>
                        </div>
                    </ConfirmButton>
                </div>
                <div className="center mb-5">
                    <img className="modal-drawing-preview" src={getImgUrl(this.props.element.id)} alt="Not available"/>
                </div>
            </Container>
        }else return null;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SingleDrawing);