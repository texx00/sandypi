import React, { Component } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';

import "./ManualControl.scss";

import { Section } from '../../../components/Section';
import CommandLine from './CommandLine';

import { send_command } from '../../../sockets/SAE';
import { settings_now } from '../../../sockets/SAC';
import Preview from './Preview';

class ManualControl extends Component{
    constructor(props){
        super(props);
        this.state = {width: 0, height: 0}; // TODO should use redux and get the values from there... The same values are retrieved for the settings page
    }

    componentDidMount(){
        settings_now((val) => {
            val = JSON.parse(val);
            this.setState({width: val.device.width, height: val.device.height})
        });
    }

    render(){
        return <Container>
                    <Row>
                        <Col>
                            <Section sectionTitle="Manual control">
                                <Row className="mb-2">
                                    <Col md className="d-flex flex-column" >
                                        <CommandLine/>
                                    </Col>
                                    <Col md>
                                        <Preview width={this.state.width} height={this.state.height}/>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col className="center">
                                        <Button className="w-25 mr-3" onClick={()=>{send_command('M112')}} title="Warning: this button will not stop the device during homing">EMERGENCY STOP</Button>
                                        <Button className="2-25" onClick={()=>{send_command('G28')}}>Home</Button>
                                    </Col>
                                </Row>
                            </Section>
                        </Col>
                    </Row>
                </Container>
    }
}

export default ManualControl;