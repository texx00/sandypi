import React, { Component } from 'react';
import { Container } from 'react-bootstrap';
import { connect } from 'react-redux';

import { Section } from '../../../components/Section';
import { ledsSetColor } from '../../../sockets/sEmits';
import { getSettings } from '../settings/selector';
import RGBWColorPicker from './RGBWColorPicker';

const mapStateToProps = (state) => {
    return {
        settings: getSettings(state)
    }
}

class LedsController extends Component{
    constructor(props){
        super();
        this.last_color = "";
    }

    changeColor(color){
        if (color !== this.last_color){
            this.last_color = color;
            ledsSetColor(color);
        }
    }

    render(){
        let show_white_channel = this.props.settings.leds.type.value === "RGBW";
        return <Container>
            <Section sectionTitle="LEDs control">
                <RGBWColorPicker
                    useWhite={show_white_channel}
                    onColorChange={this.changeColor.bind(this)}/>
            </Section>
        </Container>
    }
}

export default connect(mapStateToProps)(LedsController);