import React, { Component } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { connect } from 'react-redux';

import "./ManualControl.scss";

import { Section } from '../../../components/Section';
import CommandLine from './CommandLine';
import Preview from './Preview';

import { send_command } from '../../../sockets/SAE';
import { getDimensions } from './selector.js';

const mapStateToProps = (state) => {
    return {
        dimensions: getDimensions(state)
    }
}

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
                                        <Preview width={this.props.dimensions.width} height={this.props.dimensions.height}/>
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

export default connect(mapStateToProps)(ManualControl);