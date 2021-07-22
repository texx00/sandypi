import React, { Component } from 'react';
import { Col, Container, Form, FormGroup, Row } from 'react-bootstrap';
import { HuePicker, AlphaPicker } from 'react-color';

import { alphaToBrightness, hexToRGB, RGBAToHex, RGBToHex } from '../../../utils/colorUtils';

const DEFAULT_COLOR = "#ff0000";

class RGBWColorPicker extends Component{
    constructor(props){
        super(props);
        this.backgroundRef = React.createRef();
        this.state={
            color: DEFAULT_COLOR,
            brightness: 0.5,
            original_color: hexToRGB(DEFAULT_COLOR),
            components_color: DEFAULT_COLOR+"7f",               // starting from the middle of the brightness bar
            show_white: false
        }
        this.state_backup = {};
    }
    
    componentDidMount(){
        this.updateBackground(this.state.color);
    }

    updateColor(color, brightness){
        let c = color;
        c.a = brightness;
        c = alphaToBrightness(c);
        delete c.a;
        c = RGBToHex(c);
        let alpha_color = color;
        alpha_color.a = brightness;
        this.setState({...this.state, 
            brightness: brightness, 
            color: c,
            original_color: color,
            components_color: RGBAToHex(alpha_color)
        },
        () => {
            this.updateBackground();
            let c = this.state.color;
            if (this.state.show_white){
                c = "#000000" + c.substring(1,3);       // if should use the fourth channel will send an RGBW string with #000000ww where ww is the value for the ww channel
            }
            this.props.onColorChange(c);
        });
    }

    handleColorChange(color){
        this.updateColor(color.rgb, this.state.brightness);
    }

    handleBrigtnessChange(color){
        this.updateColor(this.state.original_color, color.rgb.a);
    }

    updateBackground(){
        this.backgroundRef.current.style.backgroundColor = this.state.color;
    }

    renderWhiteControl(){
        if (this.props.useWhite){
            return <Row>
                <Col className="center m-4">
                    <FormGroup>
                        <Form.Check
                            label="Use white channel only"
                            id="leds_white_control_checkbox"
                            type="switch"
                            onChange={(e) => {
                                if (e.target.checked){
                                    this.state_backup = this.state;
                                    this.setState({...this.state, show_white: e.target.checked}, 
                                        () => this.updateColor({r:127, g:127, b:127},1))
                                }else{
                                    this.setState({...this.state, show_white: e.target.checked}, 
                                        () => this.updateColor(this.state_backup.original_color, this.state_backup.brightness))
                                }
                            }}
                            checked={this.state.show_white}/>
                    </FormGroup>
                </Col>
            </Row>
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
                        className="leds-color-picker"
                        color={this.state.components_color.substring(0,7)}
                        onChange={(e) => {
                            if (this.state.show_white)
                                this.setState({...this.state, show_white: false, ...this.state_backup}, this.handleColorChange(e))
                            else this.handleColorChange(e)
                        }}/>
                </Col>
            </Row>
            {this.renderWhiteControl()}
            <Row>
                <Col>
                    <h4 className="center m-4">Brightness</h4>
                </Col>
            </Row>
            <Row>
                <Col className="center">
                    <AlphaPicker 
                        className="mt-2"
                        color={this.state.components_color}
                        onChange={this.handleBrigtnessChange.bind(this)}/>
                </Col>
            </Row>
        </Container>
    }
}

export default RGBWColorPicker;