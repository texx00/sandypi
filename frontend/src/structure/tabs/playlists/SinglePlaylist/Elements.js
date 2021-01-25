import React, { Component } from 'react';
import { Col, Form, Modal, OverlayTrigger, Row, Tooltip } from 'react-bootstrap';

import Image from '../../../../components/Image';
import SquareContainer from '../../../../components/SquareContainer';

import { getImgUrl } from '../../../../utils/utils';

class BasicElement extends Component{
    state = { showModal: false };
    tip = "";

    getModalOptions(){
        return false;
    }

    onOptionChange(val, option){
        let dict = {};
        dict[option.field] = val;
        this.setState({...this.state, ...dict});
    }

    renderModal(){
        if (this.no_modal) return "";       // check option to show or not the modal

        return <Modal show={this.state.showModal} 
                size="lg" 
                centered
                onHide={()=>this.setState({...this.state, showModal: false})}>
            <Modal.Header>{this.label}</Modal.Header>
            <Modal.Body>
                <Form>
                    <Row>
                        {this.getModalOptions().map((op, idx)=>{
                            let res;
                            switch(op.type){
                                case "textarea":
                                    res = <Form.Control as="textarea"
                                        value={this.state[op.field]} 
                                        onChange={(evt) => this.onOptionChange(evt.target.value, op)}/>
                                    break;
                                case "select":
                                    res = <Form.Control as="select"
                                        value={this.state[op.field]}
                                        onChange={(evt) => this.onOptionChange(evt.target.value, op)}>
                                            {op.options.map((val, idx) => { return <option key={idx}>{val}</option>})}
                                        </Form.Control>
                                    break;
                                default:
                                    res = <Form.Control value={this.state[op.field]}
                                        onChange={(evt) => this.onOptionChange(evt.target.value, op)}/>
                            }

                            return <Col key={idx}>
                                <Form.Group>
                                    <Form.Label>{op.label}</Form.Label>
                                    {res}
                                </Form.Group>
                            </Col>
                        })}
                    </Row>
                </Form>
            </Modal.Body>
        </Modal>
    }

    renderElement(){
        return <div className="bg-primary card-img-top"></div>;
    }

    renderTip(){
        if (this.tip !== ""){
            return <OverlayTrigger overlay={
                <Tooltip>
                    {this.tip}
                </Tooltip>}
                delay={{ show: 3000, hide: 250 }}>
                
                <div onClick={()=>this.setState({...this.state, showModal: true })}>
                    {this.renderElement()}
                </div>
            </OverlayTrigger>
        }else{
            return <div onClick={()=>this.setState({...this.state, showModal: true })}>
                {this.renderElement()}
            </div>
        }
    }

    render(){
        return <div>
            {this.renderModal()}
            {this.renderTip()}
        </div>;
    }
}

class DrawingElement extends BasicElement{
    no_modal = true;

    renderElement(){
        return <Image className="w-100 rounded" 
            src = {getImgUrl(this.props.element.drawing_id)} 
            alt={"Drawing "+this.props.element.drawing_id}/>
    }
}

class CommandElement extends BasicElement{
    tip = "Click to edit the command"
    label = "Edit custom command"

    getModalOptions(){
        return [{type: "textarea", field: "command", value: ""}];
    }

    renderElement(){
        return <SquareContainer>
                <div>
                    Custom command
                    {this.props.element.command}
                </div>
            </SquareContainer>
    }
}

export { BasicElement, CommandElement, DrawingElement };