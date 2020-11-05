import React, { Component } from 'react';

class CommandViewer extends Component{
    // TODO set height of the container to fill the row and use vertical scrolling inside the div
    render(){
        return <div className="bg-light rounded p-2 mb-2 text-dark command-line-history">
            <div>
                {this.props.children.map((el, index)=> {
                    if (!(el.line === "ok" && !this.props.showAcks))   // filter out acks messages
                        return <div key={index}>{(el.device ? "" : "> ") + el.line}</div>;
                    return null;})}
            </div>
        </div>
    }
}

export default CommandViewer;