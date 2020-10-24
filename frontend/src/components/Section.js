import React, { Component } from 'react';

class Section extends Component{

    render(){
        return <div className="text-primary mb-5">
            <div className="section-header mb-2 pb-3 w-100">
                <h2 className="d-inline-block m-auto">{this.props.sectionTitle}</h2>
                <button className={"float-right" + (this.props.sectionButton ? "" : " d-none")} onClick={()=>{this.props.sectionButtonHandler()}}>
                    {this.props.sectionButton}
                </button>
            </div>
            {this.props.children}
        </div>
    }
}

export default Section;