import React, { Component } from 'react';
import { Container } from 'react-bootstrap';
import { connect } from 'react-redux';

import { Section, Subsection } from '../../../components/Section';
import SortableElements from '../../../components/SortableElements';

import { queue_status } from '../../../sockets/SAC';
import { queue_get_status } from '../../../sockets/SAE';
import { listsAreEqual } from '../../../utils/dictUtils';
import { getImgUrl } from '../../../utils/utils';

import { tabBack } from '../Tabs.slice';
import { setQueueStatus } from './Queue.slice';
import { getQueueDrawingId, getQueueElements, getQueueEmpty } from './selector';

const mapStateToProps = (state) => {
    return {
        elements: getQueueElements(state),
        drawingId: getQueueDrawingId(state),
        isQueueEmpty: getQueueEmpty(state)
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        setQueueStatus: (val) => dispatch(setQueueStatus(val)),
        handleTabBack: () => dispatch(tabBack())

    }
}

class Queue extends Component{
    constructor(props){
        super(props);
        this.state = {
            elements: [], 
            refreshList: false
        }
    }

    componentDidUpdate(){
        if (!listsAreEqual(this.state.elements, this.props.elements)){
            this.setState({...this.state, elements: this.props.elements, refreshList: true});
        }
    }

    componentDidMount(){
        queue_status(this.parseQueue.bind(this));
        queue_get_status();
    }

    parseQueue(data){
        let res = JSON.parse(data);
        this.props.setQueueStatus(res);
    }

    handleSortableUpdate(val){
        console.log(val);
    }

    renderList(){
        if (this.state.elements !== undefined)
            if (this.state.elements.length > 0){
                let list = this.state.elements.map(el => {return {drawing_id: el};});
                return <Subsection sectionTitle="Coming next...">
                    <SortableElements
                        list={list}
                        onUpdate={this.handleSortableUpdate.bind(this)}
                        refreshList={this.state.refreshList}
                        onListRefreshed={()=>this.setState({...this.state, refreshList: false})}>
                    </SortableElements>
                </Subsection>
            }
        return "";
    }

    render(){
        if (this.props.isQueueEmpty){
            this.props.handleTabBack();
            return <Container>
                <div className="center pt-5">
                    Nothing is being drawn at the moment
                </div>
            </Container>
        }else return <Container>
            <Section sectionTitle="Now drawing">
                <div className="center mb-5">
                    <img className="modal-drawing-preview" src={getImgUrl(this.props.drawingId)} alt="Not available"/>
                </div>
            </Section>
            {this.renderList()}
        </Container>
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Queue);