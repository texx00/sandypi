import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Col, Form, Row } from 'react-bootstrap';
import { PlayFill, Shuffle, StopFill } from 'react-bootstrap-icons';

import IconButton from './IconButton';

import { getQueueEmpty, getQueueIntervalValue } from '../structure/tabs/queue/selector';

import { queueStartDrawings, queueStartShuffleDrawings, queueStopContinuous, queueSetInterval, playlistQueue } from '../sockets/sEmits';

const DEFAULT_MAX_VALUE = 86400.0;    // 60*60*24 seconds in a day

const mapStateToProps = (state) => {
    return {
        isQueueEmpty: getQueueEmpty(state),
        intervalValue: getQueueIntervalValue(state)
    }
}

class PlayContinuous extends Component{
    constructor(props){
        super(props);
        this.initialPropsIntervalValue = this.props.intervalValue;
        this.state = {
            intervalValue: this.props.intervalValue || 300
        };
    }

    convertMaxDelayLabel(delay){
        return delay > DEFAULT_MAX_VALUE ? (delay/DEFAULT_MAX_VALUE).toFixed(2)  + " days" : "1 day";
    }

    saveInterval(){
        queueSetInterval(this.state.intervalValue);
    }

    componentDidUpdate(){
        if (this.props.intervalValue !== this.initialPropsIntervalValue){
            this.initialPropsIntervalValue = this.props.intervalValue;
            this.setState({...this.state, intervalValue: this.props.intervalValue || 300});
        }
    }

    renderButtons(){
        if (!this.props.isQueueEmpty)
            return <Col sm={4} className="pl-4 pr-4 pt-4">
                <IconButton icon={StopFill}
                    className="w-100 center btn-dark p-2"
                    onClick={queueStopContinuous}>Stop queue</IconButton>
            </Col>
        else return <Col sm={4} className="pl-4 pr-4">
            <Row>
                <IconButton icon={PlayFill} 
                    onClick={() => {
                        queueStartDrawings(this.props.playlistId);
                    }} 
                    className="w-100 center btn-dark p-2">Play</IconButton>
            </Row>
            <Row>
                <IconButton icon={Shuffle} 
                    onClick={() => queueStartShuffleDrawings(this.props.playlistId)} 
                    className="w-100 center btn-dark p-2">Shuffle play</IconButton>
            </Row>
        </Col>
    }

    render(){
        return <Form className="m-4 mb-5">
            <Row className="rounded bg-primary p-2">
                {this.renderButtons()}
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
                                        this.saveInterval.bind(this));
                                }}/>
                        </Row>
                    </Form.Group>
                </Col>
                <Col sm={4}>
                    <Form.Group className="w-100 bg-dark rounded p-2 mt-1">
                        <Row className="mb-2">
                            <Col>
                                <Form.Label className="center">Delay between drawings [s]</Form.Label>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Form.Control value={this.state.intervalValue} 
                                    onBlur={(evt) => {
                                        this.saveInterval();
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
                                                    this.saveInterval.bind(this));
                                            else this.saveInterval();
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

export default connect(mapStateToProps)(PlayContinuous);