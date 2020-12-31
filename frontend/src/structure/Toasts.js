import React, { Component} from 'react';
import { Spinner } from 'react-bootstrap';

import Toast from 'react-bootstrap/Toast';

import { connection_status_callback, show_toast } from "../sockets/SAC";

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
            show_connection: false
        };
        this.key = 1;           // 0 for the connection status toast

        // bind the add toast function to the static functions
        // can add a toast message from everywhere with "window.show_toast(message [, duration]);"
        window.show_toast = this.addToast.bind(this);
    }
    
    componentDidMount(){
        show_toast((message)=>{this.addToast(message)});
        connection_status_callback(this.show_connection_status.bind(this));
    }

    show_connection_status(status){
        this.setState({...this.state, show_connection: !status});
    }

    addToast(message, duration=3000){
        let new_state = this.state;
        new_state.toasts.push(<CustomToast key={this.key} message={message} duration={duration}/>);
        this.key++;
        this.setState(new_state);
    }

    render(){
        return <div className="toast_container_position">
            <CustomToast key={0} 
                message={<div>
                        <Spinner animation='border' size="sm" className="mr-2"/>
                        Connection lost. Check if the server is up.
                    </div>} 
                show={this.state.show_connection} 
                autohide={false}/>
            {this.state.toasts}
        </div>
    }
}

export default Toasts;