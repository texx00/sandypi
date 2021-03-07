import React, { Component} from 'react';
import { Spinner } from 'react-bootstrap';

import Toast from 'react-bootstrap/Toast';

import { connectionStatusCallback, showToast } from "../sockets/sCallbacks";
import { cloneDict } from '../utils/dictUtils';

class CustomToast extends Component{
    constructor(props){
        super(props);
        this.state = {show: true}
    }

    render(){
        return <Toast show={this.props.show !== undefined ? this.props.show : this.state.show} 
                autohide={this.props.autohide !== undefined ? this.props.autohide : true} 
                delay={this.props.duration} 
                onClose={()=>{this.setState({show:false})}}>
            <Toast.Body>{this.props.message}</Toast.Body>
        </Toast>
    }
}

class Toasts extends Component{
    constructor(props){
        super(props);
        this.state = {
            toasts: [], 
            showConnection: false
        };
        this.key = 1;           // 0 for the connection status toast

        // bind the add toast function to the static functions
        // can add a toast message from everywhere with "window.showToast(message [, duration]);"
        window.showToast = this.addToast.bind(this);
    }
    
    componentDidMount(){
        showToast((message)=>{this.addToast(message)});
        connectionStatusCallback(this.showConnectionStatus.bind(this));
    }

    showConnectionStatus(status){
        this.setState({...this.state, showConnection: !status});
    }

    addToast(message, duration=3000){
        let newState = this.state;
        newState.toasts.push(<CustomToast key={this.key} message={message} duration={duration}/>);
        this.key++;
        this.setState(newState);
    }

    render(){
        let toasts = cloneDict(this.state.toasts);
        toasts.push(<CustomToast key={0} 
            message={<div>
                    <Spinner animation='border' size="sm" className="mr-2"/>
                    Connection lost. Check if the server is up.
                </div>} 
            show={this.state.showConnection} 
            autohide={false}/>);
        return <div className="toast_container_position">
            {toasts}
        </div>
    }
}

export default Toasts;