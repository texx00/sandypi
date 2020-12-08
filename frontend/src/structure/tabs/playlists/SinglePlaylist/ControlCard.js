import React, { Component } from 'react';
import { Col } from 'react-bootstrap';

class ControlCard extends Component{
    render(){
        return <Col sm={4} id="control_card" className="nodrag">
                <div className="card hover-zoom">
                    <div className="pb100"></div>
                    <div className="position-absolute h-100 w-100 control-card pt-5 center">Add new drawing</div>
                </div>
            </Col>
    }
}

export default ControlCard;