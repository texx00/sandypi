import React, { Component } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';

import "./ManualControl.scss";

import { Section } from '../../../components/Section';
import CommandLine from './CommandLine';
import Preview from './Preview';

import { controlEmergencyStop, sendCommand } from '../../../sockets/sEmits';

class ManualControl extends Component{

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
                                        <Preview/>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4} className="center">
                                        <Button className="w-100 m-2" onClick={()=>{controlEmergencyStop()}} title="Warning: this button will not stop the device during homing">EMERGENCY STOP</Button>
                                    </Col>
                                    <Col sm={4} className="center">
                                        <Button className="w-100 m-2" onClick={()=>{sendCommand('G28')}}>Home</Button>
                                    </Col>
                                </Row>
                            </Section>
                        </Col>
                    </Row>
                </Container>
    }
}

export default ManualControl;