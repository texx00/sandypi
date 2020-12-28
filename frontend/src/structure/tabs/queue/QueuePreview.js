import './Queue.scss';

import { Component } from 'react';
import { connect } from 'react-redux';

import { getQueueDrawingId, getQueueElements, getQueueEmpty } from './selector';
import { getImgUrl } from '../../../utils/utils';


const mapStateToProps = (state) => {
    return {
        elements: getQueueElements(state),
        drawingId: getQueueDrawingId(state),
        isQueueEmpty: getQueueEmpty(state)
    }
}

class QueuePreview extends Component{
    render(){
        return <div onClick={this.props.onClick.bind(this)} className={"preview-bar-container p-2 m-2 rounded clickable"+ (this.props.isQueueEmpty ? " d-none" : "")}>
            <div className="text-primary  d-inline-block mr-2">Now drawing: </div>
            <div className="d-inline-block preview-bar-image">
                <img src={getImgUrl(this.props.drawingId)} alt="Queued drawing"/>
            </div>
        </div>
    }
}

export default connect(mapStateToProps)(QueuePreview);