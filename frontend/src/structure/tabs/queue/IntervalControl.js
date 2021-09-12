import React, { Component } from 'react';
import { connect } from 'react-redux';

import { Col, Form, OverlayTrigger, Row, Tooltip } from "react-bootstrap";
import { queueSetInterval } from '../../../sockets/sEmits';
import { getIntervalValue, getIsQueuePaused } from './selector';
import { setInterval } from './Queue.slice';

const mapStateToProps = state => {
    return {
        intervalValue:  getIntervalValue(state),
        isPause:        getIsQueuePaused(state)
    }
}

const mapDispatchToProps = dispatch => {
    return {
        setInterval: (interval) => dispatch(setInterval(interval)) 
    }
}

class IntervalControl extends Component{
    constructor(props){
        super();
        this.state = {
            intervalValue: props.intervalValue,
            isChanging: false
        }
    }

    saveInterval(){
        queueSetInterval(this.state.intervalValue);
        this.props.setInterval(this.state.intervalValue);
    }

    componentDidUpdate(){
        if (this.props.intervalValue !== this.state.intervalValue && !this.state.isChanging){
            this.setState({...this.state, intervalValue: this.props.intervalValue});
        }
    }

    slideEnd(evt){
        this.setState({...this.state, intervalValue: evt.target.value, isChanging: false},
            this.saveInterval.bind(this));
    }

    render(){
        let tip = "Select 0 to run the drawings continuously, otherwise select the time interval that should be used between different drawings";
        if (this.props.isPause)
            tip = "It is not possible to change the time interval while the current element is paused";
        return <OverlayTrigger
            overlay={
            <Tooltip>
                {tip}
            </Tooltip>}
            delay={{ show: 3000, hide: 250 }}
            placement="bottom">
                <Form className="p-2 infos-box center align-items-center w-100 mb-5 mt-5">
                <div>
                <Form.Label>
                    Interval between drawings
                </Form.Label>
                <div>
                    Current value: {this.state.intervalValue}h
                </div>
                <Row>
                    <Col sm={1} className="pr-3">0h</Col>
                    <Col sm={8}>
                        <Form.Control type="range" 
                            value={this.state.intervalValue}
                            disabled={this.props.isPause}
                            min={0}
                            step={0.5}
                            max={24}
                            onChange={(evt) => {
                                this.setState({...this.state, intervalValue: evt.target.value, isChanging: true});
                            }}
                            onTouchEnd={this.slideEnd.bind(this)}
                            onMouseUp={this.slideEnd.bind(this)}/>
                    </Col>
                    <Col sm={1} className="pl-2">24h</Col>
                </Row>
                </div>
            </Form>
        </OverlayTrigger>
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(IntervalControl);