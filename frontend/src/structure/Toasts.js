import React, { Component} from 'react';

import Toast from 'react-bootstrap/Toast';

import {show_toast} from "../SAC";

class CustomToast extends Component{
    constructor(props){
        super(props);
        this.state = {show: true}
    }

    render(){
        return <Toast show={this.state.show} autohide={true} delay={this.props.duration} onClose={()=>{this.setState({show:false})}}>
            <Toast.Body>{this.props.message}</Toast.Body>
        </Toast>
    }
}

class Toasts extends Component{
    constructor(props){
        super(props);
        this.state = {toasts: []};
        this.key = 0;

        // bind the add toast function to the static functions
        // can add a toast message from everywhere with "window.show_toast(message [, duration]);"
        window.show_toast = this.addToast.bind(this);
    }
    
    componentDidMount(){
        show_toast((message)=>{this.addToast(message)});
    }

    addToast(message, duration=3000){
        let new_state = this.state;
        new_state.toasts.push(<CustomToast key={this.key} message={message} duration={duration}/>);
        this.key++;
        this.setState(new_state);
    }


    render(){
        return <div className="toast_container_position">
                {this.state.toasts}
        </div>
    }
}

export default Toasts;