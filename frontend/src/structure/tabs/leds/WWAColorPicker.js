import React, { Component } from 'react';
import { Col, Container, Form, FormGroup, Row } from 'react-bootstrap';
import { HuePicker, AlphaPicker } from 'react-color';
import Color from 'colorjs.io';

import "./hueOverwrite.scss";

import { alphaToBrightness, hexToRGB, RGBAToHex, RGBToHex } from '../../../utils/colorUtils';

const DEFAULT_COLOR = "#ff0000";                                // color picker left position (for the hue picker it starts with red)
// new colors for the picker. 
// they must coincide with the colors in the "./hueOverwrite.scss" file
const AMBER = new Color("#ffc400");
const WARM_WHITE = new Color("#f2ff00");
const COLD_WHITE = new Color("#9fffff");

class WWAColorPicker extends Component{
    constructor(props){
        super(props);
        this.backgroundRef = React.createRef();
        this.state={
            color: "#ffc400",                                   // color converted to WWA values
            brightness: 1,
            original_color: {                                   // original rgb color from the picker
                rgb: hexToRGB(DEFAULT_COLOR), 
                hex: DEFAULT_COLOR,
                hsl: {h:0}
            },
            alpha_picker_color: "#ffc400ff",                    // color used by the alpha color picker
            picker_color: DEFAULT_COLOR,                        // color used by the color picker
            show_autodim: false
        }
        this.state_backup = {};
    }
    
    componentDidMount(){
        this.updateBackground(this.state.color);
    }

    // this method returns the correct value for the hw.
    // cannot send the visualized rgb value since the hw is using a different encoding for the colors:
    // r -> (R -> amber, G -> cold white, B -> warm white)
    getHWRGBColor(){
        let h = this.state.original_color.hsl.h;
        let res = {
            a: this.state.brightness
        };
        // dividing into the two different mixings (A - WW and WW - CW)
        if (h<180){                         // A - WW
            res.r = 255*(180-h)/180;
            res.b = 255*h/180;
            res.g = 0;
        }else{                              // WW - CW
            h -= 180;                       // brings back the h into the 180 range (easier to handle the formulas)
            res.r = 0;
            res.b = 255*(180-h)/180;
            res.g = 255*h/180;
        }
        res = alphaToBrightness(res);       // adjusting brightness
        delete res.a;                       // removing alpha value (not needed by the hw controller)
        return RGBToHex(res);               // returning hex value
    }

    updateColor(color, brightness){
        let h = color.hsl.h;
        let ledColor = {};
        // mapping color depending on the h value of the bar
        let res;
        if (h<180){ // first half of the picker mixes amber and warm white
            res = AMBER.mix(WARM_WHITE, h/180);
        }else{      // second half mixes warm white and cold white
            res = WARM_WHITE.mix(COLD_WHITE, (h-180)/180);
        }
        // estracting the rgb value
        ledColor.r = res.p3[0]*255;
        ledColor.g = res.p3[1]*255;
        ledColor.b = res.p3[2]*255;
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
            this.props.onColorChange(this.getHWRGBColor());
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