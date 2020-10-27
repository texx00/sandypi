import React, {Component} from 'react';
import { Container, Form, Col, Button, } from 'react-bootstrap';

import {Section, Subsection, SectionGroup} from '../../components/Section';

import {settings_now} from '../../sockets/SAC';
import {settings_save} from '../../sockets/SAE';

class Settings extends Component{
    constructor(props){
        super(props);
        this.state = {settings: {
            serial: {
                port: "FAKE", 
                baud: "115200", 
                available_baudrates: ["2400", "4800", "9600", "19200", "38400", "57600", "115200", "230400", "460800", "921600"], 
                available_ports: ["FAKE"]}, 
            device: {
                width: "450", 
                height: "300"}, 
            scripts: {
                connected: "", 
                before: "", 
                after: ""}
            }
        }
    }

    componentDidMount(){
        settings_now((data)=>{this.updateState(JSON.parse(data))});
    }

    mergeDicts(og, so) {
        for (let key in so) {
            if (typeof (og[key]) === 'object') {
                og[key] = this.mergeDicts(og[key], so[key]);
            } else {
                og[key] = so[key];
            }
        }
        return og;
    }

    cloneDict(di){
        let tmp = {};
        for (let key in di){
            if (typeof (di[key]) === 'object') {
                tmp[key] = this.cloneDict(di[key]);
            } else {
                tmp[key] = di[key];
            }
        }
        return tmp;
    }

    updateState(newsettings){
        let oldsettings = this.state.settings;
        oldsettings = this.mergeDicts(oldsettings, newsettings);
        this.setState(oldsettings);
    }

    saveForm(connect=false){
        console.log("Saving settings");
        let sets = this.cloneDict(this.state.settings); // cloning the dict before deleting data
        delete sets.serial.available_baudrates;
        delete sets.serial.available_ports;
        settings_save(sets);
    }

    render(){
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
                                            defaultValue={this.state.settings.serial.port} 
                                            onChange={(e) => this.updateState({serial: {port: e.target.value}})}>
                                            { this.state.settings.serial.available_ports.map((port, index) => {
                                                return <option key={index}>{port}</option>}) }
                                        </Form.Control>
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group controlId="serial_baud">
                                        <Form.Label>Baudrate</Form.Label>
                                        <Form.Control as="select" 
                                            defaultValue={this.state.settings.serial.baud}
                                            onChange={(e) => this.updateState({serial: {baud: e.target.value}})}>
                                            { this.state.settings.serial.available_baudrates.map((baud, index) => {
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
                                        <Form.Control defaultValue={this.state.settings.device.width}
                                            onChange={(e) => this.updateState({device: {width: e.target.value}})}/>
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group>
                                        <Form.Label>Height</Form.Label>
                                        <Form.Control defaultValue={this.state.settings.device.height}
                                            onChange={(e) => this.updateState({device: {height: e.target.value}})}/>
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
                                            defaultValue={this.state.settings.scripts.connected}
                                            onChange={(e) => this.updateState({scripts: {connected: e.target.value}})}/>
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group>
                                        <Form.Label>On before drawing</Form.Label>
                                        <Form.Control as="textarea" 
                                            defaultValue={this.state.settings.scripts.before}
                                            onChange={(e) => this.updateState({scripts: {before: e.target.value}})}/>
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group>
                                        <Form.Label>On after drawing</Form.Label>
                                        <Form.Control as="textarea" 
                                            defaultValue={this.state.settings.scripts.after}
                                            onChange={(e) => this.updateState({scripts: {after: e.target.value}})}/>
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

export default Settings;