import React, { Component } from 'react';
import { Col, Form, OverlayTrigger, Tooltip } from 'react-bootstrap';

import { getSubKey } from '../../../utils/dictUtils';

class SettingField extends Component{

    getSettingValue(settingName){
        let res = this.getSettingOption(settingName);
        return res.value;
    }
    
    getSettingsAvailableValues(settingName){
        return (this.getSettingOption(settingName)).available_values;
    }

    getSettingOption(settingName){
        return getSubKey(this.props.settings, settingName);
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
                        <Form.Label>{setting.label}</Form.Label>
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
            let parentVisible = true;
            if (res.depends_on !== undefined){
                parentVisible = this.checkDependsValue(res.depends_on, res.depends_values);
            }
            return (values.includes(res.value) && parentVisible);
        }else return true;
    }

    render(){
        let setting = this.props.singleSetting;
        // check if the option should be rendered depending on the value of another option (like if the device is cartesian will not show width and height)
        if (this.checkDependsValue(setting.depends_on, setting.depends_values) && !setting.hide)
            if (setting.tip !== "" && setting.tip !== undefined)
                return <Col sm={4} className="mt-auto">
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
                return <Col sm={4} className="mt-auto">
                    {this.renderInput(setting)}
                </Col>
        else return "";
    }
}

export default SettingField;