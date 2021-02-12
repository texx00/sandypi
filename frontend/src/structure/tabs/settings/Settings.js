import React, {Component} from 'react';
import { Container, Form, Col, Button } from 'react-bootstrap';
import { connect } from 'react-redux';

import { Section, Subsection, SectionGroup } from '../../../components/Section';

import { getSettings } from "./selector.js";
import { updateAllSettings, updateSetting } from "./Settings.slice.js";

import { settings_now } from '../../../sockets/sCallbacks';
import { settings_save } from '../../../sockets/sEmits';
import { cloneDict, getSubKey } from '../../../utils/dictUtils';

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
        settings_save(sets, connect);
    }

    renderSetting(setting, key){
        // TODO add check to set option visibility depending on the selected option value if necessary and hints
        return <Col sm={4} key={key} className="mt-auto">
                {this.renderInput(setting)}
            </Col>
    }

    renderInput(setting){
        if (setting.type === "input"){
            return <Form.Group>
                    <Form.Label>{setting.label}</Form.Label>
                    <Form.Control value={this.getSettingValue(setting.name)}
                        onChange={(e) => this.props.updateSetting([ setting.name+".value", e.target.value ])}
                       />
                </Form.Group>
        }else if(setting.type === "text"){
            return <Form.Group>
                    <Form.Label>{setting.label}</Form.Label>
                    <Form.Control as="textarea" 
                        value={this.getSettingValue(setting.name)}
                        onChange={(e) => this.props.updateSetting([ setting.name+".value", e.target.value ])}/>
                </Form.Group>
        }else if(setting.type === "select"){
            return <Form.Group>
                    <Form.Group controlId={setting.name}>
                        <Form.Label>Serial port</Form.Label>
                        <Form.Control as="select" 
                            value={this.getSettingValue(setting.name)} 
                            onChange={(e) => this.props.updateSetting([ setting.name+".value", e.target.value ])}>
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
                    onChange={(e)=>{this.props.updateSetting([ setting.name+".value", e.target.checked ])}}
                    checked={this.getSettingValue(setting.name)}/>
            </Form.Group>
        }
    }

    getSettingValue(setting_name){
        let res = this.getSettingOption(setting_name);
        return res.value;
    }
    
    getSettingsAvailableValues(setting_name){
        return (this.getSettingOption(setting_name)).available_values;
    }

    getSettingOption(setting_name){
        return getSubKey(this.props.settings, setting_name);
    }

    mapEntries(entries){
        if (entries !== undefined)
            return entries.map((single_setting, key) => { 
                return this.renderSetting(single_setting[1], key);
            });
        else return "";
    }


    render(){
        let serial_entries =    Object.entries(this.props.settings.serial);
        let device_entries =    Object.entries(this.props.settings.device);
        let script_entries =    Object.entries(this.props.settings.scripts);
        let leds_entries =      Object.entries(this.props.settings.leds);

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