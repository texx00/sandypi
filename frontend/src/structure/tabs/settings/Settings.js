import React, {Component} from 'react';
import { Container, Form, Col, Button } from 'react-bootstrap';
import { connect } from 'react-redux';

import { Section, Subsection, SectionGroup } from '../../../components/Section';

import { getSettings } from "./selector.js";
import { updateAllSettings, updateSetting } from "./Settings.slice.js";

import { settings_now } from '../../../sockets/sCallbacks';
import { settings_save } from '../../../sockets/sEmits';
import { cloneDict } from '../../../utils/dictUtils';

const mapStateToProps = (state) => {
    return {
        settings: getSettings(state)
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        updateAllSettings: (settings) => dispatch(updateAllSettings(settings)),
        updateSetting: (val) => dispatch(updateSetting(val))
    }
}

class Settings extends Component{

    componentDidMount(){
        settings_now((data) => {
            this.props.updateAllSettings(JSON.parse(data));
        });
    }

    saveForm(connect=false){
        let sets = cloneDict(this.props.settings); // cloning the dict before deleting data
        delete sets.serial.available_baudrates;
        delete sets.serial.available_ports;
        settings_save(sets, connect);
    }

    render(){
        let port = this.props.settings.serial.port ? this.props.settings.serial.port : "";
        let baud = this.props.settings.serial.baud ? this.props.settings.serial.baud : "";
        let firmware = this.props.settings.serial.firmware ? this.props.settings.serial.firmware : "";
        // TODO auto generate layout directly from settings? (include a "setting type", values, etc)
        return <Container>
            <Form>
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
                                        <Form.Group controlId="firmware">
                                            <Form.Label>Firmware</Form.Label>
                                            <Form.Control as="select" 
                                                value={firmware}
                                                onChange={(e) => this.props.updateSetting(["serial.firmware", e.target.value])}>
                                                { this.props.settings.serial.available_firmwares.map((firm, index) => {
                                                    return <option key={index}>{firm}</option>
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
                        <SectionGroup sectionTitle="Device type">
                            <Container>
                                <Form.Row>
                                    <Col sm={4}>
                                        <Form.Group>
                                            <Form.Label>Width (cartesian)</Form.Label>
                                            <Form.Control value={this.props.settings.device.width}
                                                onChange={(e) => this.props.updateSetting(["device.width", e.target.value])}/>
                                        </Form.Group>
                                    </Col>
                                    <Col sm={4}>
                                        <Form.Group>
                                            <Form.Label>Height (cartesian)</Form.Label>
                                            <Form.Control value={this.props.settings.device.height}
                                                onChange={(e) => this.props.updateSetting(["device.height", e.target.value])}/>
                                        </Form.Group>
                                    </Col>
                                    <Col sm={4}>
                                        <Form.Group>
                                            <Form.Label>Radius (scara, polar)</Form.Label>
                                            <Form.Control value={this.props.settings.device.radius}
                                                onChange={(e) => this.props.updateSetting(["device.radius", e.target.value])}/>
                                        </Form.Group>
                                    </Col>
                                    <Col sm={4}>
                                        <Form.Group>
                                            <Form.Label>Type</Form.Label>
                                            <Form.Control  as="select" 
                                                value={this.props.settings.device.type}
                                                onChange={(e) => this.props.updateSetting(["device.type", e.target.value])}>
                                                {this.props.settings.device.available_types.map((el, index) => {
                                                    return <option key={index}>{el}</option>
                                                })}
                                            </Form.Control>
                                        </Form.Group>
                                    </Col>
                                    <Col sm={4}>
                                        <Form.Group>
                                            <Form.Label>Angle conversion value (the amount of units to send for a complete turn of a motor) (polar and scara only)</Form.Label>
                                            <Form.Control value={this.props.settings.device.angle_conversion_factor}
                                                onChange={(e) => this.props.updateSetting(["device.angle_conversion_factor", e.target.value])}/>
                                        </Form.Group>
                                    </Col>
                                    <Col sm={4}>
                                        <Form.Group>
                                            <Form.Label>Angle offset (angular homing position for the preview, 0 on top)(polar and scara)</Form.Label>
                                            <Form.Control value={this.props.settings.device.offset_angle_1}
                                                onChange={(e) => this.props.updateSetting(["device.offset_angle_1", e.target.value])}/>
                                        </Form.Group>
                                    </Col>
                                    <Col sm={4}>
                                        <Form.Group>
                                            <Form.Label>Homing offset for the second arm (scara only)</Form.Label>
                                            <Form.Control value={this.props.settings.device.offset_angle_2}
                                                onChange={(e) => this.props.updateSetting(["device.offset_angle_2", e.target.value])}/>
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
                        <SectionGroup sectionTitle="LEDs">
                            <Container>
                                <Form.Row>
                                    <Col>
                                        <Form.Group>
                                            <Form.Label>Leds number along the width</Form.Label>
                                            <Form.Control value={this.props.settings.leds.width}
                                                onChange={(e) => this.props.updateSetting(["leds.width", e.target.value])}/>
                                        </Form.Group>
                                    </Col>
                                    <Col>
                                        <Form.Group>
                                            <Form.Label>Leds number along the height</Form.Label>
                                            <Form.Control value={this.props.settings.leds.height}
                                                onChange={(e) => this.props.updateSetting(["leds.height", e.target.value])}/>
                                        </Form.Group>
                                    </Col>
                                    <Col>
                                        <Form.Group>
                                            <Form.Label>Leds type</Form.Label>
                                            <Form.Control  as="select" 
                                                value={this.props.settings.leds.type}
                                                onChange={(e) => this.props.updateSetting(["leds.type", e.target.value])}>
                                                {this.props.settings.leds.available_types.map((el, index) => {
                                                    return <option key={index}>{el}</option>
                                                })}
                                            </Form.Control>
                                        </Form.Group>
                                    </Col>
                                    <Col>
                                        <Form.Group>
                                            <Form.Label>Pin</Form.Label>
                                            <Form.Control value={this.props.settings.leds.pin1}
                                                onChange={(e) => this.props.updateSetting(["leds.pin1", e.target.value])}/>
                                        </Form.Group>
                                    </Col>
                                </Form.Row>
                            </Container>
                        </SectionGroup>
                    </Subsection>
                </Section>
            </Form>
        </Container>
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Settings);