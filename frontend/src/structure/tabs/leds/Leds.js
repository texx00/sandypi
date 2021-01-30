import React, { Component } from 'react';
import { Container } from 'react-bootstrap';
import { ChromePicker } from 'react-color';

import { Section } from '../../../components/Section';
import { leds_set_color } from '../../../sockets/SAE';


class LedsController extends Component{
    constructor(props){
        super(props);
        this.background_ref = React.createRef();
        this.state={color: "#aaaaaa"}
    }

    componentDidMount(){
        this.background_ref.current.style.backgroundColor = this.state.color;
    }

    handleColorChange(color){
        this.setState({...this.state, color: color.hex});
        this.background_ref.current.style.backgroundColor = color.hex;
        leds_set_color(color.rgb);
    }

    render(){
        return <Container>
            <Section sectionTitle="Select leds color">
                <div className="w-100 center mt-5">
                <div ref={this.background_ref} className="p-5 rounded">
                    <ChromePicker 
                        className="leds-color-picker"
                        color={this.state.color}
                        onChange={this.handleColorChange.bind(this)}/>
                </div>
                </div>
            </Section>
        </Container>
    }
}

export default LedsController;