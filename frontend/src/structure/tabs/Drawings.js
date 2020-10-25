import React, { Component } from 'react';
import Section from '../../components/Section';

class Drawings extends Component{

    uploadDrawingHandler(){
        
    }

    render(){
        return <Section sectionTitle="Drawings"
            sectionButton="+ Upload new drawing"
            sectionButtonHandler={this.uploadDrawingHandler.bind(this)}>
                Drawings
        </Section>
    }
}

export default Drawings;