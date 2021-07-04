import React, { Component } from 'react';
import {Form, Row, Col, Button } from 'react-bootstrap';

import { sendCommand } from '../../../sockets/sEmits';
import { deviceCommandLineReturn, deviceNewPosition} from '../../../sockets/sCallbacks';
import CommandViewer from './CommandViewer';

class CommandLine extends Component{
    constructor(props){
        super(props);
        this.state = {
            history: [], 
            showAcks: false
        };
        this.commandHistoryCounter = 0;
        this.commandHistory = [];
        this.inputRef = React.createRef();
    }

    componentDidMount(){
        deviceCommandLineReturn(this.addLine.bind(this));
        deviceNewPosition(this.addLine.bind(this));
    }
    
    submitCommand(event = null){
        sendCommand(this.getInputValue());
        this.addLine(this.getInputValue(), false);
        this.commandHistory.push(this.getInputValue());
        this.commandHistoryCounter = 0;
        this.setInputValue("");
        if (event){
            event.preventDefault();         // to prevent the submit on enter in the input form
        }
    }

    setInputValue(value){
        this.inputRef.current.value = value;
    }

    getInputValue(){
        return this.inputRef.current.value;
    }

    keyUpHandler(event){
        if (!this.commandHistory.length){
            return;
        }
        if (event.keyCode === 38) {      // Arrow up 
            if(this.commandHistoryCounter > 0){
                this.commandHistoryCounter--;
            }
        } else if (event.keyCode === 40) {      // Arrow down
            if(this.commandHistoryCounter < this.commandHistory.length){
                this.commandHistoryCounter++;
            }
        }else{
            return;
        }
        if (this.commandHistory[this.commandHistoryCounter]){
            this.setInputValue(this.commandHistory[this.commandHistoryCounter]);
        }else{
            this.setInputValue("");
        }
    }

    addLine(line, device=true){
        let ch = [...this.state.history];
        ch.push({line: line, device: device});
        // limiting the number of lines in the preview (for performance)
        while(ch.length>100)
            ch.shift();
        this.setState({history: ch});
    }

    render(){
        return <div className="h-100 p-relative d-flex flex-column command-viewer">
            <CommandViewer showAcks={this.state.showAcks}>
                {this.state.history}
            </CommandViewer>
            <Form onSubmit={this.submitCommand.bind(this)}>
                <Form.Group>
                    <Row sm={12} className="p-2">
                        <Col sm={8} className="align-items-center">
                            <Form.Control
                                placeholder="Write a command"
                                className="mt-3"
                                onKeyUp={this.keyUpHandler.bind(this)}
                                ref={this.inputRef}/>
                        </Col>
                        <Col sm={4} className="center">
                            <Button onClick={this.submitCommand.bind(this)}>Send command</Button>
                        </Col>
                    </Row>
                    <Row>
                        <Col className="center">
                            <Form.Check 
                                label="Show device acks"
                                id="ack_check"
                                type="switch"
                                onChange={(event)=>{this.setState({showAcks: event.target.checked})}}
                                checked={this.state.showAcks}/>
                        </Col>
                    </Row>
                </Form.Group>
            </Form>
        </div>
    }
}

export default CommandLine;