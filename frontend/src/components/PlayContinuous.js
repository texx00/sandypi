import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Col, Form, Row } from 'react-bootstrap';
import { PlayFill, Shuffle, StopFill } from 'react-bootstrap-icons';
import _ from 'lodash';

import IconButton from './IconButton';

import { getQueueEmpty, getQueueIntervalValue, getQueueShuffle } from '../structure/tabs/queue/selector';
import { setContinuousStatus } from '../structure/tabs/queue/Queue.slice';

import { queueStartContinuous, queueStopContinuous, queueUpdateContinuous } from '../sockets/sEmits';

const DEFAULT_MAX_VALUE = 86400.0;    // 60*60*24 seconds in a day

const mapStateToProps = (state) => {
    return {
        isQueueEmpty: getQueueEmpty(state),
        intervalValue: getQueueIntervalValue(state),
        isShuffle: getQueueShuffle(state)
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        setContinousStatus: (val) => dispatch(setContinuousStatus(val))
    }
}

class PlayContinuous extends Component{
    constructor(props){
        super(props);
        this.initialPropsIntervalValue = this.props.intervalValue;
        this.state = {
            intervalValue: this.props.intervalValue,
            shuffle: this.props.isShuffle
        };
    }

    convertMaxDelayLabel(delay){
        return delay > DEFAULT_MAX_VALUE ? (delay/DEFAULT_MAX_VALUE).toFixed(2)  + " days" : "1 day";
    }

    componentDidUpdate(){
        if (this.props.intervalValue !== this.initialPropsIntervalValue){
            this.initialPropsIntervalValue = this.props.intervalValue;
            this.setState({...this.state, intervalValue: this.props.intervalValue});
        }
    }

    renderButtons(){
        if (!this.props.isQueueEmpty)
            return <Row>
                    <IconButton icon={StopFill}
                        className="w-100 center btn-dark p-2"
                        onClick={queueStopContinuous}>Stop</IconButton>
                </Row>
        else return <Row>
                    <IconButton icon={PlayFill} 
                        onClick={() => {
                            queueStartContinuous(this.props.playlistId, this.state.shuffle, this.state.intervalValue);
                        }} 
                        className="w-100 center btn-dark p-2">Play</IconButton>
                </Row>
    }

    updateStatus(){
        let continuousStatus = {
            shuffle: this.state.shuffle,
            interval: this.state.intervalValue
        }
        queueUpdateContinuous(continuousStatus);
        this.props.setContinousStatus(continuousStatus);
    }

    render(){
        return <Form className="m-4 mb-5">
            <Row className="rounded bg-primary p-2">
                <Col sm={4}>
                    {this.renderButtons()}
                    <Row>
                        <Form.Group className="bg-dark p-2 rounded center w-100 m-1">
                            <Form.Check
                                label={<div className="text-primary d-flex">
                                        <span className="align-self-center mr-2 ml-2">
                                            <Shuffle className="icon"/>
                                        </span>
                                        Shuffle play
                                    </div>} 
                                type="switch"
                                id={_.uniqueId("shuffle-")}
                                checked={this.state.shuffle}
                                onChange={(e)=>this.setState({...this.state, shuffle: e.target.checked}, this.updateStatus.bind(this))}/>
                        </Form.Group>
                    </Row>
                </Col>
                <Col sm={4}>
                    <Form.Group className="w-100 bg-dark rounded p-2 mt-1">
                        <Row>
                            <Col>0s</Col>
                            <Col sm="auto"><Form.Label className="center">Interval</Form.Label></Col>
                            <Col className="text-right">{this.convertMaxDelayLabel(this.state.intervalValue)}</Col>
                        </Row>
                        <Row className="p-2">
                            <Form.Control type="range" 
                                className="range-style pl-2 pr-2 bg-dark"
                                value={this.state.intervalValue}
                                min={0}
                                max={Math.max(this.state.intervalValue, DEFAULT_MAX_VALUE)}
                                onChange={(evt) => {
                                    this.setState({...this.state, intervalValue: evt.target.value});
                                }}
                                onMouseUp={(evt) => {
                                    this.setState({...this.state, intervalValue: evt.target.value},
                                        this.updateStatus.bind(this));
                                }}/>
                        </Row>
                    </Form.Group>
                </Col>
                <Col sm={4}>
                    <Form.Group className="w-100 bg-dark rounded p-2 mt-1">
                        <Row className="mb-2">
                            <Col>
                                <Form.Label className="center">Interval between drawings [s]</Form.Label>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Form.Control 
                                    className="center"
                                    value={this.state.intervalValue} 
                                    onBlur={(evt) => {
                                        this.updateStatus();
                                    }}
                                    onChange={(evt) => {
                                        if (evt.target.value === ""){
                                            this.setState({...this.state, intervalValue: ""});
                                            return; 
                                        }
                                        let val = parseInt(evt.target.value);
                                        if (Number.isInteger(val)){
                                            if (val > 0)
                                                this.setState({...this.state, intervalValue: val});
                                        }
                                            
                                    }}
                                    onKeyUp={(evt) => {
                                        if (evt.code === "Enter"){
                                            if (this.state.intervalValue === "")
                                                this.setState({...this.state, intervalValue: 0}, 
                                                    this.updateStatus.bind(this));
                                            else this.updateStatus();
                                            evt.preventDefault();
                                        }
                                        else return evt;
                                    }}/>
                            </Col>
                        </Row>
                    </Form.Group>
                </Col>
            </Row>
        </Form>
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(PlayContinuous);