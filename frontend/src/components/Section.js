import React, { Component } from 'react';
import IconButton from './IconButton';
import { Row, Col } from "react-bootstrap";

function renderTitle(component, tag){
    const TagName = tag;
    if (component.props.titleButtonHandler !== undefined)
        return <TagName className="d-inline-block m-auto clickable"
            onClick={()=>component.props.titleButtonHandler()}>{component.props.sectionTitle}</TagName>
    else return <TagName className="d-inline-block m-auto">{component.props.sectionTitle}</TagName>
}

class Section extends Component{

    render(){
        return <div className="text-primary mb-5">
            <Row className="section-header ml-1 mb-2 pb-3 w-100">
                <Col sm="auto" md="auto" className="center">
                    {renderTitle(this, "h2")}
                </Col>
                <Col sm="auto" md={true}></Col>
                <Col sm="auto" md="auto" className="m-2 center">
                    <IconButton 
                        className={"float-right" + (this.props.sectionButton ? "" : " d-none")} 
                        onClick={()=>this.props.sectionButtonHandler()}
                        icon={this.props.buttonIcon}>
                        {this.props.sectionButton}
                    </IconButton>
                </Col>
            </Row>
            {this.props.children}
        </div>
    }
}


class Subsection extends Component{
    
    render(){
        return <div className="text-primary mb-5">
            <div className="section-header mb-2 pb-3 w-100">
                {renderTitle(this, "h4")}
                <IconButton className={"float-right" + (this.props.sectionButton ? "" : " d-none")} 
                    onClick={()=>{this.props.sectionButtonHandler()}}
                    icon={this.props.buttonIcon}>
                    {this.props.sectionButton}
                </IconButton>
            </div>
            {this.props.children}
        </div>
    }
}


class SectionGroup extends Component{

    render(){
        return <div className="text-primary mb-5">
            <div className="mb-2 pb-3 w-100">
                {renderTitle(this, "h4")}
                <IconButton className={"btn float-right" + (this.props.sectionButton ? "" : " d-none")} 
                    onClick={()=>{this.props.sectionButtonHandler()}}
                    icon={this.props.buttonIcon}>
                    {this.props.sectionButton}
                </IconButton>
            </div>
        {this.props.children}
    </div>
    }
}

export {Section, Subsection, SectionGroup};