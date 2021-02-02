import React, { Component } from 'react';
import {Form, Row, Col, Button } from 'react-bootstrap';

import { send_command } from '../../../sockets/sEmits';
import { device_command_line_return, device_new_position} from '../../../sockets/sCallbacks';
import CommandViewer from './CommandViewer';

class CommandLine extends Component{
    constructor(props){
        super(props);
        this.state = {
            history: [], 
            show_acks: false
        };
        this.command_history_counter = 0;
        this.command_history = [];
        this.input_ref = React.createRef();
    }

    componentDidMount(){
        device_command_line_return(this.addLine.bind(this));
        device_new_position(this.addLine.bind(this));
    }
    
    submitCommand(event = null){
        send_command(this.getInputValue());
        this.addLine(this.getInputValue(), false);
        this.command_history.push(this.getInputValue());
        this.command_history_counter = 0;
        this.setInputValue("");
        if (event){
            event.preventDefault();         // to prevent the submit on enter in the input form
        }
    }

    setInputValue(value){
        this.input_ref.current.value = value;
    }

    getInputValue(){
        return this.input_ref.current.value;
    }

    keyUpHandler(event){
        if (!this.command_history.length){
            return;
        }
        if (event.keyCode === 38) {      // Arrow up 
            if(this.command_history_counter > 0){
                this.command_history_counter--;
            }
        } else if (event.keyCode === 40) {      // Arrow down
            if(this.command_history_counter < this.command_history.length){
                this.command_history_counter++;
            }
        }else{
            return;
        }
        if (this.command_history[this.command_history_counter]){
            this.setInputValue(this.command_history[this.command_history_counter]);
        }else{
            this.setInputValue("");
        }
    }

    addLine(line, device=true){
        let ch = [...this.state.history];
        ch.push({line: line, device: device});
        // limiting the number of lines in the preview (for performance)
        while(ch.lenght>20)
            ch.shift();
        this.setState({history: ch});
    }

    render(){
        return <div className="h-100 p-relative d-flex flex-column command-viewer">
            <CommandViewer showAcks={this.state.show_acks}>
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
                                ref={this.input_ref}/>
                        </Col>
                        <Col sm={4}>
                            <Button onClick={this.submitCommand.bind(this)}>Send command</Button>
                        </Col>
                    </Row>
                    <Row>
                        <Col className="center">
                        <Form.Check 
                            label="Show device acks"
                            id="ack_check"
                            type="switch"
                            onChange={(event)=>{this.setState({show_acks: event.target.checked})}}
                            checked={this.state.show_acks}/>
                        </Col>
                    </Row>
                </Form.Group>
            </Form>
        </div>
    }
}

export default CommandLine;