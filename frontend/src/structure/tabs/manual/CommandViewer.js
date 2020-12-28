import React, { Component } from 'react';

class CommandViewer extends Component{
    constructor(props){
        super(props);
        this.scrollDiv = React.createRef();
    }

    scrollToBottom(){
        this.scrollDiv.current.scrollIntoView({behaviour: "smooth", block: "nearest", inline: "start"});
    }
    
    componentDidUpdate(){
        this.scrollToBottom();
    }

    render(){
        return <div className="bg-light rounded p-2 mb-2 text-dark command-line-history">
            <div>
                {this.props.children.map((el, index)=> {
                    if (!(el.line === "ok" && !this.props.showAcks))   // filter out acks messages
                        return <div key={index}>{(el.device ? "" : "> ") + el.line}</div>;
                    return null;})}
                <div ref={this.scrollDiv} />
            </div>
        </div>
    }
}

export default CommandViewer;