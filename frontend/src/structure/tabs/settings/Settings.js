import React, {Component} from 'react';
import { Container, Form, Col, Button, Row } from 'react-bootstrap';
import { PlusSquare, Save, Trash } from 'react-bootstrap-icons';
import { connect } from 'react-redux';

import { Section, Subsection, SectionGroup } from '../../../components/Section';
import IconButton from '../../../components/IconButton';

import { getSettings } from "./selector.js";
import { createNewHWButton, removeHWButton, updateAllSettings, updateSetting } from "./Settings.slice.js";

import { settingsNow } from '../../../sockets/sCallbacks';
import { settingsSave } from '../../../sockets/sEmits';
import { cloneDict } from '../../../utils/dictUtils';
import SettingField from './SettingField';
import SoftwareVersion from './SoftwareVersion';

const mapStateToProps = (state) => {
    return {
        settings: getSettings(state)
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        updateAllSettings: (settings) => dispatch(updateAllSettings(settings)),
        updateSetting:          (val) => dispatch(updateSetting(val)),
        createNewHWButton:         () => dispatch(createNewHWButton()),
        removeHWButton:         (idx) => dispatch(removeHWButton(idx))
    }
}

class Settings extends Component{

    componentDidMount(){
        settingsNow((data) => {
            this.props.updateAllSettings(JSON.parse(data));
        });
    }

    saveForm(connect=false){
        let sets = cloneDict(this.props.settings); // cloning the dict before deleting data
        settingsSave(sets, connect);
    }

    mapEntries(entries){
        if (entries !== undefined)
            return entries.map((singleSetting, key) => { 
                return <SettingField
                    key={key}
                    singleSetting={singleSetting[1]}
                    settings={this.props.settings}
                    onUpdateSetting={this.props.updateSetting.bind(this)}/>
            });
        else return "";
    }

    generateHWSettings(){
        if (!this.props.settings.buttons.available) // TODO include LEDS in this check
            return "";
        else return <Subsection sectionTitle="Additional hardware">
            {this.generateHWLEDs()}
            {this.generateHWButtonsForm()}
        </Subsection>
    }

    generateHWButtonsForm(){
        if (!this.props.settings.buttons.available)  // if the buttons are not available with the current hw will just hide the option
            return "";
        let rows = this.props.settings.buttons.buttons.map((button_option, i) => {
            let b = cloneDict(button_option);
            let idx = b.idx;
            let tmp = this.props.settings.buttons.available_values.filter(i => {return i.label === b.click.value});
            if (tmp.length > 0)
                b.click.tip = tmp[0].description;
            return <Form.Row key={idx} className="mb-5">
                <SettingField
                    singleSetting={b.pin}
                    settings={this.props.settings}
                    onUpdateSetting={this.props.updateSetting.bind(this)}
                    key={"bp_"+idx}/>
                <SettingField
                    singleSetting={b.click}
                    settings={this.props.settings}
                    onUpdateSetting={this.props.updateSetting.bind(this)}
                    key={"bc_"+idx}/>
                <SettingField
                    singleSetting={b.press}
                    settings={this.props.settings}
                    onUpdateSetting={this.props.updateSetting.bind(this)}
                    key={"br_"+idx}/>
                <SettingField
                    singleSetting={b.pull}
                    settings={this.props.settings}
                    onUpdateSetting={this.props.updateSetting.bind(this)}
                    key={"bl_"+idx}/>
                <Col sm={4} className="mt-4 w-100 pt-1">
                    <IconButton 
                        className="w-100 mt-1 center"
                        icon={Trash}
                        onClick={() => this.props.removeHWButton(idx)}>
                        Remove button
                    </IconButton>
                </Col>
            </Form.Row>
        });
        return <SectionGroup sectionTitle="Buttons">
            <p>
                In this section it is possible to specify which functionality should be associated to any HW button wired in the table. 
                Add as many buttons as needed, specify the GPIO input pin (BCM index) and select the associated function from the dropdown menu. 
                For every button two actions are available: click and long press.
                Each action can be choosen independently.</p>
            <Container>
                {rows}
                <Form.Row className="center mt-2">
                    <IconButton className="center w-100"
                        icon={PlusSquare}
                        onClick={this.props.createNewHWButton.bind(this)}>
                        Add a new hardware button
                    </IconButton>
                </Form.Row>
            </Container>
        </SectionGroup>;
    }

    generateHWLEDs(){
        if (this.props.settings.leds.available){
            let ledsEntries =      Object.entries(this.props.settings.leds);
            return <SectionGroup sectionTitle="LEDs">
                <Container>
                    <Form.Row>
                        {this.mapEntries(ledsEntries)}
                    </Form.Row>
                </Container>
            </SectionGroup>
        }else return "";
    }

    // render the list of settings divided by sections
    render(){
        let serialEntries =    Object.entries(this.props.settings.serial);
        let deviceEntries =    Object.entries(this.props.settings.device);
        let scriptEntries =    Object.entries(this.props.settings.scripts);
        let autostartEntries = Object.entries(this.props.settings.autostart);

        return <Container>
            <Form>
                <Section sectionTitle="Settings"
                    sectionButtonHandler={this.saveForm.bind(this)}
                    buttonIcon={Save}
                    sectionButton="Save settings">
                    <Subsection sectionTitle="Device settings">
                        <SectionGroup sectionTitle="Serial port settings">
                            <Container>
                                <Form.Row>
                                    {this.mapEntries(serialEntries)}
                                    <Col>
                                        <Button className="w-100 h-100" onClick={() => this.saveForm(true)}>Save and connect</Button>
                                    </Col>
                                </Form.Row>
                            </Container>
                        </SectionGroup>
                        <SectionGroup sectionTitle="Device type">
                            <Container>
                                <Form.Row>
                                    {this.mapEntries(deviceEntries)}
                                </Form.Row>
                            </Container>
                        </SectionGroup>
                    </Subsection>
                    <Subsection sectionTitle="Automatisms">
                        <SectionGroup sectionTitle="Scripts">
                            <Container>
                                <Form.Row>
                                    {this.mapEntries(scriptEntries)}
                                </Form.Row>
                            </Container>
                        </SectionGroup>
                        <SectionGroup sectionTitle="Autostart options">
                            <Container>
                                <Form.Row>
                                    {this.mapEntries(autostartEntries)}
                                </Form.Row>
                            </Container>
                        </SectionGroup>
                    </Subsection>
                    {this.generateHWSettings()}
                </Section>
                <SectionGroup sectionTitle="Software info">
                    <Container>
                        <SoftwareVersion/>
                    </Container>
                </SectionGroup>
                <Row className="pr-3 pl-2 mb-5">
                    <Col>
                        <IconButton
                            className="w-100 center"
                            icon={Save}
                            onClick={() => this.saveForm()}>
                                Save settings
                        </IconButton>
                    </Col>
                </Row>
            </Form>
        </Container>
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Settings);