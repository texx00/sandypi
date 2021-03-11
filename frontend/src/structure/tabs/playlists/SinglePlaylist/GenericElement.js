import React, { Component } from 'react';
import { Col, Form, Modal, OverlayTrigger, Row, Spinner, Tooltip } from 'react-bootstrap';
import { Trash, FileCheck } from 'react-bootstrap-icons';

import IconButton from '../../../../components/IconButton';
import SquareContainer from '../../../../components/SquareContainer';
import FormDatetime from '../../../../components/FormDatetime';

class GenericElement extends Component{
    constructor(props){
        super(props);
        let showModalDefault = false;
        if (this.props.showModal !== undefined)
            showModalDefault = this.props.showModal;
        this.state = { showModal: showModalDefault, ...this.mapOptionsToState()};
    }

    // Tip to be shown when overing the card for some time. If empty will not show the tip
    tip = "";
    // Modal title when opening the element options
    label = "";
    // Modal description (to help the user with some instructions about the options available)
    description = "";

    // This method must be overridden the child component. It renders the card content
    renderElement(){
        return <SquareContainer className="center align-item-center">
            <div>
                <Spinner animation="border" className={this.props.noMargin==="true" ? "" : "m-5"}/>
            </div>
        </SquareContainer>
    }

    /* This method must be overridden in the child component. It returns the options that must be shown in the modal
     * return false if there is no option to be shown with a modal
     * return a list of options to be shown (the options will then be saved into the element and then in the playlist)
     *   options must have the following fields:
     *      - type: textarea, select or input(default)
     *      - field: the name of the option to change in the element
     *      - value: usually should return the element value (this.props.element.field)
     *      - label: label to be shown on top of the option
     *      - options (optional): necessary for the type "select". Specify the list of available options
     */
    getModalOptions(){
        return false;
    }

    
    // ---- Base class methods. There should be no need to override from here on -----
 
    // Method to map the element options to the state for the modal options
    mapOptionsToState(){
        let options = this.getModalOptions();   // load default options values
        if (!options) return {};            // if the options are not set, should return an empty dict to join in the state

        let res = {};
        options.forEach((op) => {           // create a pair "filter-value" for each option of getModalOption
            let dict = {};
            dict[op.field] = op.value;
            res = {...res, ...dict};
        });
        return res;
    }

    mapStateToElement(){
        let options = this.getModalOptions();
        let res = {};
        options.forEach((op) =>{
            let dict = {};
            dict[op.field] = this.state[op.field];
            res = {...res, ...dict};
        });
        return {...this.props.element, ...res};
    }

    // on change handler for the options in the modal
    onOptionChange(val, option){
        let dict = {};
        dict[option.field] = val;
        this.setState({...this.state, ...dict});
    }

    // it the "customModalOptions" method is defined in the child will use that instead of creating the standard options
    renderModalOptions(){
        if (this.customModalOptions !== undefined)
            return this.customModalOptions();
        else return this.getModalOptions().filter(op => {return !op.hidden}).map((op, idx)=>{    // maps only non-hidden options
            return this.renderSingleOption(op, idx);
        });
    }

    renderSingleOption(op, idx){
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
                        {op.options.map((val, idx) => { return <option value={val.value}key={idx}>{val.label}</option>})}
                    </Form.Control>
                break;
            case "date":
                res = <Form.Control type="date"
                    value={this.state[op.field]} 
                    onChange={(evt) => this.onOptionChange(evt.target.value, op)}/>
                break;
            case "time":
                res = <Form.Control type="time"
                    value={this.state[op.field]} 
                    onChange={(evt) => this.onOptionChange(evt.target.value, op)}/>
                break;
            case "datetime":
                res = <FormDatetime
                    value={this.state[op.field]}
                    onChange={(val) => this.onOptionChange(val, op)}/>
                break;
            default:
                res = <Form.Control
                    value={this.state[op.field]}
                    onChange={(evt) => this.onOptionChange(evt.target.value, op)}/>
        }

        return <Col key={idx}>
            <Form.Group>
                <Form.Label>{op.label}</Form.Label>
                {res}
            </Form.Group>
        </Col>
    }

    // renders the description of the element options
    renderDescription(){
        if (this.description !== undefined && this.description !== ""){
            return <div>
                <Row>
                    <Col>
                        {this.description}
                    </Col>
                </Row>
                <hr className="pb-3"/>
            </div>
        }else return "";
    }

    // renders the modal
    renderModal(){
        if (!this.getModalOptions()) return "";       // check option to show or not the modal
        
        return <Modal show={this.state.showModal} 
                size="lg" 
                centered
                onHide={()=>this.setState({...this.state, showModal: false})}>
            <Modal.Header className="center">{this.label}</Modal.Header>
            <Modal.Body>
                {this.renderDescription()}
                <Form>
                    <Row>
                        {this.renderModalOptions()}
                    </Row>
                </Form>
            </Modal.Body>
            <Modal.Footer className="center">
                <IconButton icon={Trash} 
                    onClick={()=>{
                        this.setState({showModal: false, ...this.mapOptionsToState()}); // reset to the default values for the options and hide the modal
                    }}>
                    Undo
                </IconButton>
                <IconButton icon={FileCheck} 
                    onClick={()=>{
                        this.props.onOptionsChange(this.mapStateToElement());
                        this.setState({...this.state, showModal: false});
                    }}>
                    Save
                </IconButton>
            </Modal.Footer>
        </Modal>
    }

    handleClick(){
        if (!(this.props.hideOptions === "true"))
            this.setState({...this.state, showModal: true });
        if (this.props.onClick) this.props.onClick();
    }

    // render a trigger for a tooltip around the card content
    renderTip(){
        if (this.tip !== "" && !this.props.hideOptions === "true"){
            return <OverlayTrigger overlay={
                <Tooltip>
                    {this.tip}
                </Tooltip>}
                delay={{ show: 3000, hide: 250 }}>
                
                <div onClick={this.handleClick.bind(this)}>
                    {this.renderElement()}
                </div>
            </OverlayTrigger>
        }else{
            return <div onClick={this.handleClick.bind(this)}>
                {this.renderElement()} 
            </div>
        }
    }

    // renders modal with element options and then the card content
    render(){
        // if an element has a preview for the queue that must be different (like an icon instead of text) can use the renderPreview method to return a different render value
        if (this.renderPreview !== undefined && this.props.showPreview !== undefined)
            return <div>
                {this.renderPreview()}
            </div>
        else return <div>
                {this.renderModal()}
                {this.renderTip()}
            </div>;
    }
}

export default GenericElement;