import React, { Component } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { AlphaPicker } from 'react-color';
import { alphaToBrightness, RGBAToHex, RGBToHex } from '../../../utils/colorUtils';

const DEFAULT_COLOR = "#ffffff";

class DimmableColorPicker extends Component{
    constructor(props){
        super(props);
        this.state={
            brightness: 1,
            components_color: DEFAULT_COLOR + "ff"
        }
    }

    handleBrigtnessChange(color){
        color = color.rgb;
        this.setState({...this.state, brightness: color.a, components_color: RGBAToHex(color)},
        this.props.onColorChange(RGBToHex(alphaToBrightness(color, 0.99))));
    }

    render(){
        return <Container>
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

export default DimmableColorPicker;