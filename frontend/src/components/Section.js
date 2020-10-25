import React, { Component } from 'react';
import { Button } from 'react-bootstrap';

class Section extends Component{

    render(){
        return <div className="text-primary mb-5">
            <div className="section-header mb-2 pb-3 w-100">
                <h2 className="d-inline-block m-auto">{this.props.sectionTitle}</h2>
                <Button className={"float-right" + (this.props.sectionButton ? "" : " d-none")} onClick={()=>{this.props.sectionButtonHandler()}}>
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
                <h4 className="d-inline-block m-auto">{this.props.sectionTitle}</h4>
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
                <h4 className="d-inline-block m-auto">{this.props.sectionTitle}</h4>
                <Button className={"btn float-right" + (this.props.sectionButton ? "" : " d-none")} onClick={()=>{this.props.sectionButtonHandler()}}>
                    {this.props.sectionButton}
                </Button>
            </div>
        {this.props.children}
    </div>
    }
}

export {Section, Subsection, SectionGroup};