import React, { Component } from 'react';
import { Col, Container, Form, FormGroup, Row } from 'react-bootstrap';
import { HuePicker, AlphaPicker } from 'react-color';

import "./hueOverwrite.scss";

import { alphaToBrightness, hexToRGB, RGBAToHex, RGBToHex } from '../../../utils/colorUtils';

const DEFAULT_COLOR = "#ff0000";

class WWAColorPicker extends Component{
    constructor(props){
        super(props);
        this.backgroundRef = React.createRef();
        this.state={
            color: "#ffff00",                                   // color converted to WWA values
            brightness: 1,
            original_color: {                                   // original rgb color from the picker
                rgb: hexToRGB(DEFAULT_COLOR), 
                hex: DEFAULT_COLOR,
                hsl: {h:0}
            },
            alpha_picker_color: "#ffff00ff",                    // color used by the alpha color picker
            picker_color: DEFAULT_COLOR,                        // color used by the color picker
            show_white: false,
            show_autodim: false
        }
        this.state_backup = {};
    }
    
    componentDidMount(){
        this.updateBackground(this.state.color);
    }

    updateColor(color, brightness){
        let h = color.hsl.h;
        let ledColor = {};
        ledColor.r = Math.floor(Math.min(255, 255*(360-h)/180));
        ledColor.g = 255;
        ledColor.b = Math.floor(Math.min(255, 255*(h)/180));
        ledColor.a = brightness;
        ledColor = alphaToBrightness(ledColor);
        delete ledColor.a;
        let alpha_color = ledColor;
        alpha_color.a = brightness;
        this.setState({...this.state, 
            brightness: brightness, 
            color: RGBToHex(ledColor),
            original_color: color,
            alpha_picker_color: RGBAToHex(alpha_color),
            picker_color: RGBAToHex(color.rgb)
        },
        () => {
            this.updateBackground();
            this.props.onColorChange(this.state.color);
        });
    }

    handleColorChange(color){
        this.updateColor(color, this.state.brightness);
    }

    handleBrigtnessChange(color){
        this.updateColor(this.state.original_color, color.rgb.a);
    }

    updateBackground(){
        this.backgroundRef.current.style.backgroundColor = this.state.color;
    }

    renderAutoDim(){
        if (this.props.useAutoDim){
            return <Col className="center m-4">
                <FormGroup>
                    <Form.Check
                        label="Use autodim"
                        id="leds_autodim_control_checkbox"
                        type="switch"
                        onChange={(e) => {
                            this.setState({...this.state, show_autodim: e.target.checked},
                                () => this.props.onAutoDimChange(e.target.checked))
                        }}
                        checked={this.state.show_autodim}/>
                </FormGroup>
            </Col>
        }
        else return "";
    }

    render(){
        return <Container>
            <Row>
                <Col>
                    <h4 className="center mb-4 mr-4 ml-4">Color</h4>
                </Col>
            </Row>
            <Row>
                <Col 
                    className="center rounded p-5" 
                    ref={this.backgroundRef}>
                    <HuePicker 
                        className="leds-color-picker leds-wwa"
                        color={this.state.original_color.hex.substring(0,7)}
                        onChange={(e) => { this.handleColorChange(e) }}/>
                </Col>
            </Row>
            <Row>
                {this.renderAutoDim()}
            </Row>
            <Row>
                <Col>
                    <h4 className="center m-4">Brightness</h4>
                </Col>
            </Row>
            <Row>
                <Col className="center">
                    <AlphaPicker 
                        className="mt-2"
                        color={this.state.alpha_picker_color}
                        onChange={this.handleBrigtnessChange.bind(this)}/>
                </Col>
            </Row>
        </Container>
    }
}

export default WWAColorPicker;