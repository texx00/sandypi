import React, { Component } from 'react';
import { Container } from 'react-bootstrap';
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
import IconButton from '../../../components/IconButton';

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
                    <IconButton className="btn" 
                        icon={Play}
                        onClick={()=>{
                            drawing_queue(this.props.element.id);
                    }}>
                        {start_drawing_label}
                    </IconButton>
                    <IconButton className="btn"
                        icon={PlusSquare}>
                        Add to playlist
                    </IconButton>
                    <ConfirmButton className="btn" 
                        icon={FileEarmarkX}
                        onClick={()=> {
                            drawing_delete(this.props.element.id);
                            this.props.deleteDrawing(this.props.element.id);
                            this.props.handleTabBack();
                    }}>
                        Delete drawing
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