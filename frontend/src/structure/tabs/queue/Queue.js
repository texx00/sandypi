import React, { Component } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { Forward, Stop, Trash } from 'react-bootstrap-icons';
import { connect } from 'react-redux';
import IconButton from '../../../components/IconButton';

import { Section, Subsection } from '../../../components/Section';
import SortableElements from '../../../components/SortableElements';

import { queueStatus } from '../../../sockets/sCallbacks';
import { queueGetStatus, queueSetOrder, queueStopCurrent } from '../../../sockets/sEmits';
import { listsAreEqual } from '../../../utils/dictUtils';
import { getElementClass } from '../playlists/SinglePlaylist/Elements';
import { isViewQueue } from '../selector';

import { setTab, tabBack } from '../Tabs.slice';
import ETA from './ETA';
import { setQueueElements, setQueueStatus } from './Queue.slice';
import { getQueueCurrent, getQueueElements, getQueueEmpty, getQueueProgress } from './selector';

const mapStateToProps = (state) => {
    return {
        elements: getQueueElements(state),
        currentElement: getQueueCurrent(state),
        isQueueEmpty: getQueueEmpty(state),
        isViewQueue: isViewQueue(state),
        progress: getQueueProgress(state)
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
        // TODO add a pause and restart button
        return "";
    }

    renderClearQueue(){
        if (this.state.elements !== undefined)
            if (this.state.elements.length > 0){
                return [
                    <Row>
                        <IconButton className={"w-100 center"} icon={Forward}>Start next drawing</IconButton>
                    </Row>,
                    <Row>
                        <IconButton className={"w-100 center"} icon={Trash}>Clear queue</IconButton>
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
                                <ETA progress={this.props.progress || {eta: -1}}/>
                            </Row>
                            <Row>
                                <IconButton className={"w-100 center"} icon={Stop}>Stop</IconButton>
                            </Row>
                            {this.renderPauseRestart()}
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