import './Queue.scss';

import { Component } from 'react';
import { connect } from 'react-redux';
import { ArrowRepeat, Eye, PauseFill, PlayFill, Shuffle, SkipForwardFill, StopFill } from 'react-bootstrap-icons';

import IconButton from '../../../components/IconButton';

import { getIsQueuePaused, getQueueElements, getQueueEmpty, getQueueIsRunning, getQueueRepeat, getQueueShuffle } from './selector';
import { setTab } from '../Tabs.slice';
import { isViewQueue } from '../selector';
import { toggleQueueRepeat, toggleQueueShuffle } from './Queue.slice';
import { drawingPause, drawingResume, queueNextDrawing, queueSetRepeat, queueSetShuffle, queueStartRandom, queueStopAll } from '../../../sockets/sEmits';

const mapStateToProps = (state) => {
    return {
        elements:       getQueueElements(state),
        isQueueEmpty:   getQueueEmpty(state),
        isPause:        getIsQueuePaused(state),
        isViewQueue:    isViewQueue(state),
        isRepeat:       getQueueRepeat(state),
        isShuffle:      getQueueShuffle(state),
        isRunning:      getQueueIsRunning(state)
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        handleTab:      (name) => dispatch(setTab(name)),
        toggleShuffle:      () => dispatch(toggleQueueShuffle()),
        toggleRepeat:       () => dispatch(toggleQueueRepeat())
    }
}

class QueueControls extends Component{
    renderPausePlay(){
        if (this.props.isPause)
            return <IconButton className="btn btn-dark p-2" 
                onClick={()=>{
                    drawingResume();
                }}
                iconMedium = "true"
                tip = "Resume current drawing"
                icon={PlayFill}>
            </IconButton>
        else return <IconButton className="btn btn-dark p-2" 
                onClick={()=>{
                    drawingPause();
                }}
                iconMedium = "true"
                tip = "Pause current drawing (will require some seconds)"
                icon={PauseFill}>
            </IconButton>
    }

    render(){
        if (this.props.isRunning){
            return <div className="preview-bar-container p-2 m-2 rounded">
                
                <IconButton className = {"btn p-2 " + (this.props.isViewQueue ? "" : " btn-dark")}
                    onClick={()=>{this.props.handleTab("queue")}}
                    iconMedium = "true"
                    tip = "Click to view the queue"
                    icon={Eye}>
                </IconButton>
                <IconButton className = {"btn p-2" + (this.props.isRepeat ? "" : " btn-dark")}
                    onClick={()=>{
                        queueSetRepeat(!this.props.isRepeat);
                        this.props.toggleRepeat();
                    }}
                    iconMedium = "true"
                    tip = "Click to enable the repetition of the elements in the queue"
                    icon={ArrowRepeat}>
                </IconButton>
                <IconButton className = {"btn p-2" + (this.props.isQueueEmpty ? " d-none" : "") + (this.props.isShuffle ? "" : " btn-dark")}
                    onClick={()=>{
                        queueSetShuffle(!this.props.isShuffle);
                        this.props.toggleShuffle();
                    }}
                    iconMedium = "true"
                    tip = "Click to enable shuffle mode for the queue"
                    icon={Shuffle}>
                </IconButton>
                {this.renderPausePlay()}
                <IconButton className = {"btn btn-dark p-2" + (this.props.isQueueEmpty ? " d-none" : "")}
                    onClick={()=>{
                        queueNextDrawing();
                    }}
                    iconMedium = "true"
                    tip = "Click to stop the current drawing and start the next in the queue"
                    icon={SkipForwardFill}>
                </IconButton>
                <IconButton className = "btn btn-dark p-2" 
                    onClick={()=>{
                        queueStopAll();
                    }}
                    iconMedium = "true"
                    tip = "Click to clear the queue and stop the current drawing"
                    icon={StopFill}>
                </IconButton>
            </div>
        }else{
            // TODO add a check to show this only if there is at least one uploaded drawing
            return <div className="preview-bar-container p-2 m-2 rounded">
                <IconButton className = "btn btn-dark p-2"
                    onClick = {() => {
                        queueStartRandom();
                    }}
                    icon={Shuffle}
                    tip = "Will choose a random drawing to play among the ones uploaded. If the repeat button is selected will select a new one after the first is finished">
                    Start a random drawing
                </IconButton>
            </div>
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(QueueControls);