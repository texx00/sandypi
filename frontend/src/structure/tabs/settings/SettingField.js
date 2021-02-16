import React, { Component } from 'react';
import { Col, Form, OverlayTrigger, Tooltip } from 'react-bootstrap';

import { getSubKey } from '../../../utils/dictUtils';

class SettingField extends Component{

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
    
    renderInput(setting){
        if (setting.type === "input"){
            return <Form.Group>
                    <Form.Label>{setting.label}</Form.Label>
                    <Form.Control value={this.getSettingValue(setting.name)}
                        onChange={(e) => this.props.onUpdateSetting([ setting.name+".value", e.target.value ])}
                       />
                </Form.Group>
        }else if(setting.type === "text"){
            return <Form.Group>
                    <Form.Label>{setting.label}</Form.Label>
                    <Form.Control as="textarea" 
                        value={this.getSettingValue(setting.name)}
                        onChange={(e) => this.props.onUpdateSetting([ setting.name+".value", e.target.value ])}/>
                </Form.Group>
        }else if(setting.type === "select"){
            return <Form.Group>
                    <Form.Group controlId={setting.name}>
                        <Form.Label>Serial port</Form.Label>
                        <Form.Control as="select" 
                            value={this.getSettingValue(setting.name)} 
                            onChange={(e) => this.props.onUpdateSetting([ setting.name+".value", e.target.value ])}>
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
                    onChange={(e)=>{this.props.onUpdateSetting([ setting.name+".value", e.target.checked ])}}
                    checked={this.getSettingValue(setting.name)}/>
            </Form.Group>
        }
    }
    
    checkDependsValue(field, values){
        if (field!== undefined){
            let res = this.getSettingOption(field);
            let parent_visible = true;
            if (res.depends_on != undefined){
                parent_visible = this.checkDependsValue(res.depends_on, res.depends_values);
            }
            return (values.includes(res.value) && parent_visible);
        }else return true;
    }

    render(){
        let setting = this.props.single_setting;
        // check if the option should be rendered depending on the value of another option (like if the device is cartesian will not show width and height)
        if (this.checkDependsValue(setting.depends_on, setting.depends_values))
            if (setting.tip !== "" && setting.tip !== undefined)
                return <Col sm={4} key={this.props.key} className="mt-auto">
                    <OverlayTrigger overlay={
                        <Tooltip>
                            {setting.tip}
                        </Tooltip>}
                        delay={{ show: 2000, hide: 250 }}>
                            <div>
                                {this.renderInput(setting)}
                            </div>
                    </OverlayTrigger>
                </Col>
            else
                return <Col sm={4} key={this.props.key} className="mt-auto">
                    {this.renderInput(setting)}
                </Col>
        else return "";
    }
}

export default SettingField;