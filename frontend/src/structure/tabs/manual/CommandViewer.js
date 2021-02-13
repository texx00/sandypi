import React, { Component } from 'react';

class CommandViewer extends Component{
    constructor(props){
        super(props);
        this.scrollDiv = React.createRef();
    }

    scrollToBottom(){
        // TODO scroll to bottom only if already there otherwise keep the scroll position
        this.scrollDiv.current.scrollIntoView({behaviour: "smooth", block: "nearest", inline: "start"});
    }
    
    componentDidUpdate(){
        this.scrollToBottom();
    }

    render(){
        // TODO fix height to stay fixed when new lines are added and the scroll bar appears
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