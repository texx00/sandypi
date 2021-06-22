import './Queue.scss';

import { Component } from 'react';
import { connect } from 'react-redux';

import IconButton from '../../../components/IconButton';

import { getQueueCurrent, getQueueElements, getQueueEmpty } from './selector';
import { getElementClass } from '../playlists/SinglePlaylist/Elements';
import { ArrowRepeat, Eye, PauseFill, Shuffle, SkipForwardFill, StopFill } from 'react-bootstrap-icons';

const mapStateToProps = (state) => {
    return {
        elements: getQueueElements(state),
        currentElement: getQueueCurrent(state),
        isQueueEmpty: getQueueEmpty(state)
    }
}

class QueueControls extends Component{
    render(){
        if (this.props.currentElement !== undefined){
            let ElementType = getElementClass(this.props.currentElement);
            return <div className={"preview-bar-container p-2 m-2 rounded"+ (this.props.isQueueEmpty ? " d-none" : "")}>
                
                <IconButton className="btn btn-dark p-2" 
                    onClick={()=>{this.props.handleTab("queue")}}
                    iconMedium = "true"
                    icon={Eye}>
                </IconButton>
                <IconButton className="btn btn-dark p-2" 
                    onClick={()=>{console.log("Repeat")}}
                    iconMedium = "true"
                    icon={ArrowRepeat}>
                </IconButton>
                <IconButton className="btn btn-dark p-2" 
                    onClick={()=>{console.log("repeat")}}
                    iconMedium = "true"
                    icon={Shuffle}>
                </IconButton>
                <IconButton className="btn btn-dark p-2" 
                    onClick={()=>{console.log("pause")}}
                    iconMedium = "true"
                    icon={PauseFill}>
                </IconButton>
                <IconButton className="btn btn-dark p-2" 
                    onClick={()=>{console.log("next")}}
                    iconMedium = "true"
                    icon={SkipForwardFill}>
                </IconButton>
                <IconButton className="btn btn-dark p-2" 
                    onClick={()=>{console.log("stop")}}
                    iconMedium = "true"
                    icon={StopFill}>
                </IconButton>
            </div>
        }else{
            return ""
        }
    }
}

export default connect(mapStateToProps)(QueueControls);