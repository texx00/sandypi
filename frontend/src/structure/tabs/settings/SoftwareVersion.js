import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Col, Container, Row } from 'react-bootstrap';
import { CloudArrowDown, CloudSlash, ExclamationTriangleFill } from 'react-bootstrap-icons';

import IconButton from '../../../components/IconButton';
import { getCurrentHash, updateAutoEnabled, updateDockerComposeLatest } from './selector';
import { setTab } from '../Tabs.slice';
import { toggleAutoUpdateEnabled } from '../../../sockets/sEmits';
import { home_site } from '../../../utils/utils';

const mapStateToProps = (state) => {
    return {
        updateEnabled: updateAutoEnabled(state),
        currentHash: getCurrentHash(state),
        dockerComposeLatest: updateDockerComposeLatest(state)
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        goToHome: () => dispatch(setTab("home"))
    }
}

class SoftwareVersion extends Component{

    renderUpdateButton(){
        if (this.props.updateEnabled)
            return <IconButton icon={CloudSlash} onClick={toggleAutoUpdateEnabled}>Disable automatic updates</IconButton>
        else return <IconButton icon={CloudArrowDown} onClick={toggleAutoUpdateEnabled}>Enable automatic updates</IconButton>
    }

    renderDockerComposeUpdate(){
        if (!this.props.dockerComposeLatest){
            return <Row className="mt-4">
                <Col className="w-100 center alert alert-danger d-inline p-4"><p>
                    <div className="corner-icon "><ExclamationTriangleFill width="32" height="32"/></div>
                    <span><h4 className="pb-0 mb-0">Docker-compose.yml file update available</h4><br/> A new version of the docker-compose file is available but requires to be updated manually. Check the <a href={home_site}>Github</a> homepage to see how to update.</span>
                </p></Col>
            </Row>
        }
        return "";
    }

    // todo add docker files version check
    render(){
        return <Container>
            <p></p>
            <Row>
                <Col sm={6} className="center pt-2">
                    Current software version shash: &nbsp;<p className={"text-light"}>{this.props.currentHash}</p>
                </Col>
                <Col sm={6} className="center">
                    {this.renderUpdateButton()}
                </Col>
            </Row>
            {this.renderDockerComposeUpdate()}
        </Container>
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SoftwareVersion);