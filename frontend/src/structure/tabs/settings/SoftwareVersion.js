import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Col, Container, Form, Modal, Row } from 'react-bootstrap';
import { CloudArrowDown } from 'react-bootstrap-icons';

import IconButton from '../../../components/IconButton';
import { getCurrentBranch, getCurrentHash, isUpToDate } from './selector';
import { setTab } from '../Tabs.slice';
import { softwareChangeBranch, softwareStartUpdate } from '../../../sockets/sEmits';

const mapStateToProps = (state) => {
    return {
        isUpToDate: isUpToDate(state),
        currentHash: getCurrentHash(state),
        currentBranch: getCurrentBranch(state)
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        goToHome: () => dispatch(setTab("home"))
    }
}

const BRANCHES = ["Master", "Alpha", "Beta"];

class SoftwareVersion extends Component{

    constructor(props){
        super(props);
        this.state = {
            showUpdateConfirmModal: false,
            showBranchChangeModal: false,
            newBranch: ""
        }
    }

    renderUpdateButton(){
        if (this.isUpToDate){
            return <p>You are up to date</p>
        }else return <IconButton icon={CloudArrowDown}
            onClick={() => this.setState({...this.state, showUpdateConfirmModal: true})}>
            Update the software
        </IconButton>
    }

    render(){
        return <Container>
            <p className="text-danger">
                ATTENTION: the update button is just a shortcut to update without the need of the command line.
                This feature is not optimized yet and the automatic update may not work. 
                Use it only if you know what you are doing.
            </p>
            <p>
                NOTE: the master branch is the most stable version of the software. 
                The beta branch is a pre-release branch and we try to fix all the bugs there before merging to the master branch.
                The alpha brings all the latest features but it is for sure full of bugs (not suited for the everyday usage probably)
            </p>
            <Row>
                <Col sm={4}>
                    Current version: <p className={"text-light"}>{this.props.currentBranch +" - " + this.props.currentHash}</p>
                </Col>
                <Col sm={4}>
                    {this.renderUpdateButton()}
                </Col>
                <Col>
                    <Form.Group>
                        <Form.Group controlId={"update.branch"}>
                            <Form.Label>Branch</Form.Label>
                            <Form.Control as="select" 
                                value={this.props.currentBranch} 
                                onChange={(e) => this.setState({...this.state, showBranchChangeModal: true, newBranch: e.target.value})}>
                                {BRANCHES.map((b, index) => {
                                    return <option key={index}>{b}</option>
                                })}
                            </Form.Control>
                        </Form.Group>
                    </Form.Group>
                </Col>
            </Row>
            <Modal show={this.state.showBranchChangeModal} 
                size="lg" 
                centered 
                onHide={() => this.setState({...this.state, showBranchChangeModal: false})}>
                <Modal.Header className="center">
                    <Modal.Title>Change branch</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        Are you sure you want to change branch? 
                        This operation can break the software. 
                        In this case you will need to fix it from the command line or even make a fresh install
                    </p>
                    <Row>
                        <Col className="center">
                            <IconButton onClick={() => this.setState({...this.state, showBranchChangeModal: false})}>
                                No, changed my mind
                            </IconButton>
                        </Col>
                        <Col className="center">
                            <IconButton onClick={() => this.setState({...this.state, showBranchChangeModal: false}, () => {
                                    softwareChangeBranch(this.state.newBranch);
                                    this.props.goToHome();
                                })}>
                                Yes, I know what I'm doing
                            </IconButton>
                        </Col>
                    </Row>
                </Modal.Body>
            </Modal>
            <Modal show={this.state.showUpdateConfirmModal} 
                size="lg" 
                centered 
                onHide={() => this.setState({...this.state, showUpdateConfirmModal: false})}>
                <Modal.Header className="center">
                    <Modal.Title>Confirm update</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="p-5 center">
                        Are you sure you want to update the software now? 
                        The device will be restarted.
                        The operation may not be completed succesfully and the software may break.
                        To fix it you may need to use the command line or make a fresh install.
                    </p>
                    <Row>
                        <Col className="center">
                            <IconButton onClick={() => this.setState({...this.state, showUpdateConfirmModal: false})}>
                                No, will do it later
                            </IconButton>
                        </Col>
                        <Col className="center">
                            <IconButton onClick={() => this.setState({...this.state, showUpdateConfirmModal: false}, () => {
                                    softwareStartUpdate();
                                    this.props.goToHome();
                                })}>
                                Yes, update
                            </IconButton>
                        </Col>
                    </Row>
                </Modal.Body>
            </Modal>
        </Container>
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SoftwareVersion);