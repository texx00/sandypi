import React, { Component } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { Pause, Play, SkipForward, Stop, Trash } from 'react-bootstrap-icons';
import { connect } from 'react-redux';

import IconButton from '../../../components/IconButton';
import { Section, Subsection } from '../../../components/Section';
import SortableElements from '../../../components/SortableElements';

import { queueStatus } from '../../../sockets/sCallbacks';
import { drawingPause, drawingResume, queueGetStatus, queueSetOrder, queueStopAll, queueStopCurrent } from '../../../sockets/sEmits';

import { listsAreEqual } from '../../../utils/dictUtils';
import { getElementClass } from '../playlists/SinglePlaylist/Elements';
import ETA from './ETA';

import { getIsQueuePaused, getQueueCurrent, getQueueElements, getQueueEmpty, getQueueProgress } from './selector';
import { isViewQueue } from '../selector';
import { setQueueElements, setQueueStatus } from './Queue.slice';
import { setTab, tabBack } from '../Tabs.slice';

const mapStateToProps = (state) => {
    return {
        elements: getQueueElements(state),
        currentElement: getQueueCurrent(state),
        isQueueEmpty: getQueueEmpty(state),
        isViewQueue: isViewQueue(state),
        progress: getQueueProgress(state),
        isPaused: getIsQueuePaused(state)
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        setQueueStatus: (val) => dispatch(setQueueStatus(val)),
        handleTabBack: () => dispatch(tabBack()),
        setQueueElements: (list) => dispatch(setQueueElements(list)),
        setTabHome: () => dispatch(setTab('home'))
    }
}

class Queue extends Component{
    constructor(props){
        super(props);
        this.state = {
            elements: []
        }
    }

    componentDidUpdate(){
        if (!listsAreEqual(this.state.elements, this.props.elements)){
            this.setState({...this.state, elements: this.props.elements, refreshList: true});
        }
        if (this.props.isQueueEmpty && this.props.isViewQueue){
            this.props.handleTabBack();
        }
    }

    componentDidMount(){
        queueStatus(this.parseQueue.bind(this));
        queueGetStatus();
    }

    parseQueue(data){
        let res = JSON.parse(data);
        res.elements = res.elements.map((el) => { return JSON.parse(el) });
        this.props.setQueueStatus(res);
    }

    handleSortableUpdate(list){
        if (!listsAreEqual(list, this.state.elements)){
            this.setState({...this.state, elements: list});
            this.props.setQueueElements(list);
            queueSetOrder(list);
        }
    }

    clearQueue(){
        // save an empty list
        this.handleSortableUpdate([]);
    }

    stopDrawing(){
        queueStopCurrent();
    }
    
    // TODO show shuffle/interval if in continous mode?

    renderPauseRestart(){
        if (this.props.isPaused)
            return <IconButton className={"w-100 center"}
                icon={Play}
                onClick={drawingResume}>
                    Resume drawing
            </IconButton>
        else return <IconButton className={"w-100 center"}
                icon={Pause}
                onClick={drawingPause}>
                    Pause drawing
                </IconButton>
    }

    renderClearQueue(){
        if (this.state.elements !== undefined)
            if (this.state.elements.length > 0){
                return [
                    <Row>
                        <IconButton className={"w-100 center"} 
                            icon={SkipForward}
                            onClick={queueStopCurrent}>
                                Start next drawing
                        </IconButton>
                    </Row>,
                    <Row>
                        <IconButton className={"w-100 center"} 
                            icon={Trash}
                            onClick={this.clearQueue.bind(this)}>
                                Clear queue
                        </IconButton>
                    </Row>
                ]
            }
        return "";
    }

    renderList(){
        if (this.state.elements !== undefined)
            if (this.state.elements.length > 0){
                return <Subsection sectionTitle="Coming next:" className="mb-5">
                        <SortableElements
                            list={this.state.elements}
                            onUpdate={this.handleSortableUpdate.bind(this)}
                            hideOptions={true}>
                        </SortableElements>
                    </Subsection>
            }
        return "";
    }

    render(){
        if (this.props.isQueueEmpty){
            return <Container>
                <div className="center pt-5">
                    Nothing is being drawn at the moment
                </div>
                <div className="center pt-3">
                    <Button onClick={() => this.props.setTabHome()}>Homepage</Button>
                </div>
            </Container>
        }else{
            let ElementType = getElementClass(this.props.currentElement);
            return <Container>
                <Section sectionTitle="Now drawing">
                    <Row className={"center"}>
                        <Col sm={6} className="mb-5 position-relative">
                            <ElementType element={this.props.currentElement}
                                hideOptions={"true"}/>
                        </Col>
                        <Col sm={1}/>
                        <Col sm={4} className="pr-5 pl-5">
                            <Row>
                                <ETA progress={this.props.progress || {eta: -1}} isPaused={this.props.isPaused}/>
                            </Row>
                            <Row>
                                <IconButton className={"w-100 center"} 
                                    icon={Stop}
                                    onClick={queueStopAll}>
                                        Stop
                                </IconButton>
                            </Row>
                            <Row>
                                {this.renderPauseRestart()}
                            </Row>
                            {this.renderClearQueue()}
                        </Col>
                    </Row>
                </Section>
                {this.renderList()}
            </Container>
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Queue);