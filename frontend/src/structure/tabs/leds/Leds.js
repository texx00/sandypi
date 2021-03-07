import React, { Component } from 'react';
import { Container } from 'react-bootstrap';
import { ChromePicker } from 'react-color';

import { Section } from '../../../components/Section';
import { ledsSetColor } from '../../../sockets/sEmits';


class LedsController extends Component{
    constructor(props){
        super(props);
        this.backgroundRef = React.createRef();
        this.state={color: "#aaaaaa"}
    }

    componentDidMount(){
        this.backgroundRef.current.style.backgroundColor = this.state.color;
    }

    handleColorChange(color){
        this.setState({...this.state, color: color.hex});
        this.backgroundRef.current.style.backgroundColor = color.hex;
        ledsSetColor(color.rgb);
    }

    render(){
        return <Container>
            <Section sectionTitle="Select leds color">
                <div className="w-100 center mt-5">
                <div ref={this.backgroundRef} className="p-5 rounded">
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