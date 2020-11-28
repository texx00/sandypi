import React, { Component } from 'react';
import {connect } from 'react-redux';

import { queue_status } from '../../../sockets/SAC';
import { queue_get_status } from '../../../sockets/SAE';

import { setQueueEmpty, setQueueNotEmpty } from './Queue.slice';

const mapStateToProps = (state) => {
    return {}
}

const mapDispatchToProps = (dispatch) => {
    return {
        setQueueEmpty: () => dispatch(setQueueEmpty()),
        setQueueNotEmpty: () => dispatch(setQueueNotEmpty())
    }
}

class Queue extends Component{
    componentDidMount(){
        queue_status(this.parseQueue.bind(this));
        queue_get_status();
    }

    parseQueue(data){
        let res = JSON.parse(data);
        if (res.now_drawing_id !== 0)
            this.props.setQueueNotEmpty();
        else this.props.setQueueEmpty();

        //console.log(res);
    }


    render(){
        return <div></div>
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Queue);