import React, {Component} from 'react';
import { Container, Form, Col, Button, } from 'react-bootstrap';
import { connect } from 'react-redux';

import {Section, Subsection, SectionGroup} from '../../../components/Section';

import { getSettings } from "./selector.js";
import { updateAllSettings, updateSetting } from "./Settings.slice.js";
import { setDeviceSize } from "../manual/ManualControl.slice.js";

import { settings_now } from '../../../sockets/SAC';
import { settings_save } from '../../../sockets/SAE';
import { cloneDict } from '../../../utils/dictUtils';

const mapStateToProps = (state) => {
    return {
        settings: getSettings(state)
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        updateAllSettings: (settings) => dispatch(updateAllSettings(settings)),
        updateSetting: (val) => dispatch(updateSetting(val)),
        setDeviceSize: (props) => dispatch(setDeviceSize({width: props.settings.device.width, height: props.settings.device.height}))
    }
}

class Settings extends Component{

    componentDidMount(){
        settings_now((data) => {
            this.props.updateAllSettings(JSON.parse(data));
            this.props.setDeviceSize(this.props);
        });
    }

    saveForm(connect=false){
        let sets = cloneDict(this.props.settings); // cloning the dict before deleting data
        delete sets.serial.available_baudrates;
        delete sets.serial.available_ports;
        settings_save(sets, connect);
        this.props.setDeviceSize(this.props);
    }

    render(){
        let port = this.props.settings.serial.port ? this.props.settings.serial.port : "";
        let baud = this.props.settings.serial.baud ? this.props.settings.serial.baud : "";
        return <Form>
            <Section sectionTitle="Settings"
                sectionButtonHandler={this.saveForm.bind(this)}
                sectionButton="Save settings">
                <Subsection sectionTitle="Device settings">
                    <SectionGroup sectionTitle="Serial port settings">
                        <Container>
                            <Form.Row>
                                <Col>
                                    <Form.Group controlId="serial_port">
                                        <Form.Label>Serial port</Form.Label>
                                        <Form.Control as="select" 
                                            value={port} 
                                            onChange={(e) => this.props.updateSetting(["serial.port", e.target.value ])}>
                                            { this.props.settings.serial.available_ports.map((port, index) => {
                                                return <option key={index}>{port}</option>}) }
                                        </Form.Control>
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group controlId="serial_baud">
                                        <Form.Label>Baudrate</Form.Label>
                                        <Form.Control as="select" 
                                            value={baud}
                                            onChange={(e) => this.props.updateSetting(["serial.baud", e.target.value])}>
                                            { this.props.settings.serial.available_baudrates.map((baud, index) => {
                                                return <option key={index}>{baud}</option>
                                            })}
                                        </Form.Control>
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Button className="w-100 h-100" onClick={() => this.saveForm(true)}>Save and connect</Button>
                                </Col>
                            </Form.Row>
                        </Container>
                    </SectionGroup>
                    <SectionGroup sectionTitle="Dimensions">
                        <Container>
                            <Form.Row>
                                <Col>
                                    <Form.Group>
                                        <Form.Label>Width</Form.Label>
                                        <Form.Control value={this.props.settings.device.width}
                                            onChange={(e) => this.props.updateSetting(["device.width", e.target.value])}/>
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group>
                                        <Form.Label>Height</Form.Label>
                                        <Form.Control value={this.props.settings.device.height}
                                            onChange={(e) => this.props.updateSetting(["device.height", e.target.value])}/>
                                    </Form.Group>
                                </Col>
                            </Form.Row>
                        </Container>
                    </SectionGroup>
                    <SectionGroup sectionTitle="Scripts">
                        <Container>
                            <Form.Row>
                                <Col>
                                    <Form.Group>
                                        <Form.Label>On connection</Form.Label>
                                        <Form.Control as="textarea" 
                                            value={this.props.settings.scripts.connected}
                                            onChange={(e) => this.props.updateSetting(["scripts.connected", e.target.value])}/>
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group>
                                        <Form.Label>On before drawing</Form.Label>
                                        <Form.Control as="textarea" 
                                            value={this.props.settings.scripts.before}
                                            onChange={(e) => this.props.updateSetting(["scripts.before", e.target.value])}/>
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group>
                                        <Form.Label>On after drawing</Form.Label>
                                        <Form.Control as="textarea" 
                                            value={this.props.settings.scripts.after}
                                            onChange={(e) => this.props.updateSetting(["scripts.after", e.target.value])}/>
                                    </Form.Group>
                                </Col>
                            </Form.Row>
                        </Container>
                    </SectionGroup>
                </Subsection>
            </Section>
        </Form>
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Settings);