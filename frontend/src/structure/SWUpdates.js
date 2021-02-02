import { Component } from 'react';
import { connect } from 'react-redux';

import {socket} from "../sockets/sCallbacks";
import { shouldCheckUpdate } from './tabs/settings/selector';
import { updateCheckTime } from './tabs/settings/Settings.slice';

const mapStateToProps = (state) => {
    return { should_check_update: shouldCheckUpdate(state) }
}

const mapDispatchToProps = (dispatch) => {
    return { updateCheckTime: () => dispatch(updateCheckTime()) }
}

class SWUpdates extends Component{
    constructor(props){
        super(props);
        this.checked = false;
    }

    componentDidMount(){
        
        if ((!this.checked) && this.props.should_check_update){
            this.check_software_updates()
            this.checked = true;
        }
    }
    
    check_software_updates(){
        console.log("Checking for updates");
        socket.on("software_updates_response", (response) =>{
            window.show_toast(response, 10000);
            this.props.updateCheckTime();
        });
        socket.emit("software_updates_check");
    }

    render(){
        return null;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SWUpdates);