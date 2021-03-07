import React, {Component} from 'react';
import { Container, Form, Col, Button } from 'react-bootstrap';
import { connect } from 'react-redux';

import { Section, Subsection, SectionGroup } from '../../../components/Section';

import { getSettings } from "./selector.js";
import { updateAllSettings, updateSetting } from "./Settings.slice.js";

import { settingsNow } from '../../../sockets/sCallbacks';
import { settingsSave } from '../../../sockets/sEmits';
import { cloneDict } from '../../../utils/dictUtils';
import SettingField from './SettingField';

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

    // render the list of settings divided by sections
    render(){
        let serialEntries =    Object.entries(this.props.settings.serial);
        let deviceEntries =    Object.entries(this.props.settings.device);
        let scriptEntries =    Object.entries(this.props.settings.scripts);
        let ledsEntries =      Object.entries(this.props.settings.leds);

        return <Container>
            <Form>
                <Section sectionTitle="Settings"
                    sectionButtonHandler={this.saveForm.bind(this)}
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
                        <SectionGroup sectionTitle="Scripts">
                            <Container>
                                <Form.Row>
                                    {this.mapEntries(scriptEntries)}
                                </Form.Row>
                            </Container>
                        </SectionGroup>
                        {/*<SectionGroup sectionTitle="LEDs">
                            <Container>
                                <Form.Row>
                                    {this.mapEntries(ledsEntries)}
                                </Form.Row>
                            </Container>
                        </SectionGroup>*/}
                    </Subsection>
                </Section>
            </Form>
        </Container>
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Settings);