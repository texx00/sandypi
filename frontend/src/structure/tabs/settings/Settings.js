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

    renderSetting(setting, key){
        // TODO add check to set option visibility depending on the selected option value if necessary
        
        return <Col sm={4} key={key}>
                {this.renderInput(setting)}
            </Col>
    }

    renderInput(setting){
        if (setting.type === "input"){
            return <Form.Group>
                    <Form.Label>{setting.label})</Form.Label>
                    <Form.Control value={this.getSettingValue(setting.name)}
                        onChange={(e) => this.props.updateSetting([setting.name, e.target.value])}/>
                </Form.Group>
        }else if(setting.type === "textarea"){
            return <Form.Group>
                    <Form.Label>{setting.label}</Form.Label>
                    <Form.Control as="textarea" 
                        value={this.getSettingValue(setting.name)}
                        onChange={(e) => this.props.updateSetting([setting.name, e.target.value])}/>
                </Form.Group>
        }else if(setting.type === "select"){
            return <Form.Group>
                    <Form.Group controlId={setting.name}>
                        <Form.Label>Serial port</Form.Label>
                        <Form.Control as="select" 
                            value={this.getSettingValue(setting.name)} 
                            onChange={(e) => this.props.updateSetting([setting.value, e.target.value ])}>
                            { this.getSettingsAvailableValues(setting.name).map((opt, index) => {
                                return <option key={index}>{opt}</option>}) }
                        </Form.Control>
                    </Form.Group>
                </Form.Group>
        }else if(setting.type === "check"){
            return <Form.Group>
                <Form.Check 
                    label={setting.label}
                    id={setting.name.replace(".", "_")}
                    type="switch"
                    onChange={(e)=>{this.props.updateSetting([setting.name, e.target.checked])}}
                    checked={this.getSettingValue(setting.name)}/>
            </Form.Group>
        }
    }

    getSettingValue(setting_name){
        return this.getSettingOption(setting_name).value;
    }
    
    getSettingsAvailableValues(setting_name){
        return this.getSettingOption(setting_name).available_values
    }

    getSettingOption(setting_name){
        let res = setting_name.split(".");
        let sett = cloneDict(this.props.settings);
        for (let r in res){
            sett = sett[r];
        }
        return sett;
    }

    mapEntries(entries){
        return entries.map((single_setting, key) => { 
            // TODO check this
            //single_setting = single_setting[1]
            return this.renderSetting(single_setting, key);
        });
    }


    render(){
        let serial_entries =    Object.entries(this.props.settings.serial);
        let device_entries =    Object.entries(this.props.settings.device);
        let script_entries =    Object.entries(this.props.settings.scripts);
        let leds_entries =      Object.entries(this.props.settings.leds);
        console.log(serial_entries)

        return <Container>
            <Form>
                <Section sectionTitle="Settings"
                    sectionButtonHandler={this.saveForm.bind(this)}
                    sectionButton="Save settings">
                    <Subsection sectionTitle="Device settings">
                        <SectionGroup sectionTitle="Serial port settings">
                            <Container>
                                <Form.Row>
                                    {this.mapEntries(serial_entries)}
                                    <Col>
                                        <Button className="w-100 h-100" onClick={() => this.saveForm(true)}>Save and connect</Button>
                                    </Col>
                                </Form.Row>
                            </Container>
                        </SectionGroup>
                        <SectionGroup sectionTitle="Device type">
                            <Container>
                                <Form.Row>
                                    {this.mapEntries(device_entries)}
                                </Form.Row>
                            </Container>
                        </SectionGroup>
                        <SectionGroup sectionTitle="Scripts">
                            <Container>
                                <Form.Row>
                                    {this.mapEntries(script_entries)}
                                </Form.Row>
                            </Container>
                        </SectionGroup>
                        <SectionGroup sectionTitle="LEDs">
                            <Container>
                                <Form.Row>
                                    {this.mapEntries(leds_entries)}
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