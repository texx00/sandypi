import React, { Component } from 'react';
import {Button, Row, Col} from 'react-bootstrap';

class ConfirmButton extends Component{
    constructor(props){
        super(props);
        this.state = { mustConfirm: false }
    }

    render(){
        return <div>
                <Button 
                    className={this.state.mustConfirm ? "d-none" : ""}
                    onClick={ ()=> this.setState({mustConfirm: true})}>
                    {this.props.children}
                </Button>
                <div className={this.state.mustConfirm ? "" : "d-none"}>
                    <Row>
                        <Col>Are you sure?
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Button
                                className="btn-success"
                                onClick={ (evt)=> this.props.onClick(evt)}>
                                Yes
                            </Button>
                        </Col>
                        <Col>
                            <Button
                                className="btn-danger"
                                onClick={ (evt)=> this.setState({mustConfirm: false})}>
                                No
                            </Button>
                        </Col>
                    </Row>
                </div>
            </div>
    }
}

export default ConfirmButton;