import React, { Component } from 'react';
import { Button } from 'react-bootstrap';

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
            <div className="section-header mb-2 pb-3 w-100">
                {renderTitle(this, "h2")}
                <Button className={"float-right" + (this.props.sectionButton ? "" : " d-none")} onClick={()=>this.props.sectionButtonHandler()}>
                    {this.props.sectionButton}
                </Button>
            </div>
            {this.props.children}
        </div>
    }
}


class Subsection extends Component{
    
    render(){
        return <div className="text-primary mb-5">
            <div className="section-header mb-2 pb-3 w-100">
                {renderTitle(this, "h4")}
                <Button className={"float-right" + (this.props.sectionButton ? "" : " d-none")} onClick={()=>{this.props.sectionButtonHandler()}}>
                    {this.props.sectionButton}
                </Button>
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
                <Button className={"btn float-right" + (this.props.sectionButton ? "" : " d-none")} onClick={()=>{this.props.sectionButtonHandler()}}>
                    {this.props.sectionButton}
                </Button>
            </div>
        {this.props.children}
    </div>
    }
}

export {Section, Subsection, SectionGroup};