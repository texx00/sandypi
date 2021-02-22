import React, { Component } from 'react';
import { Navbar, Nav, Dropdown, ButtonGroup } from 'react-bootstrap';
import { ChevronCompactLeft, Sliders } from 'react-bootstrap-icons';
import { connect } from 'react-redux';
import IconButton from '../components/IconButton';

import QueuePreview from './tabs/queue/QueuePreview';

import { showBack } from './tabs/selector';
import { setTab, tabBack } from './tabs/Tabs.slice';
import { systemIsLinux } from './tabs/settings/selector';
import { settings_reboot_system, settings_shutdown_system } from '../sockets/sEmits';

const mapStateToProps = (state) => {
    return { 
        show_back: showBack(state),
        is_linux: systemIsLinux(state)
    }
}

const mapDispatchToProps = (dispatch) => {
    return { 
        handleTab: (name) => dispatch(setTab(name)),
        handleTabBack: () => dispatch(tabBack())
    }
}

class TopBar extends Component{

    renderBack(){
        if (this.props.show_back)
            return <Nav.Link key={20} className="text-bold" onClick={()=>{this.props.handleTabBack()}}><ChevronCompactLeft/>Back</Nav.Link>
        else return "";
    }

    renderSettingsButton(){
        // TODO update the "is_linux" setting in the default_settings.json file and consequently the implementation here
        if (this.props.is_linux)
            return <Dropdown as={ButtonGroup}>
                <IconButton className="btn btn-dark mr-0" 
                    onClick={()=>{this.props.handleTab("settings")}}
                    icon={Sliders}>
                        Settings
                </IconButton>

                <Dropdown.Toggle split className="btn btn-dark ml-0" id="dropdown-split-basic" />
                <Dropdown.Menu className="bg-light" value="undefined">
                    <Dropdown.Item className="hover-primary"
                        onClick={() => settings_shutdown_system()}>Shutdown</Dropdown.Item>
                    <Dropdown.Item className="hover-primary"
                        onClick={() => settings_reboot_system()}>Reboot</Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
        else return <IconButton className="btn btn-dark" 
                onClick={()=>{this.props.handleTab("settings")}}
                icon={Sliders}>
                    Settings
            </IconButton>
    }

    render(){
        return <div>
            
            <Navbar bg="primary" collapseOnSelect expand="lg" sticky="top" className="center">
                    <Navbar.Brand href="#home" onClick={()=>{this.props.handleTab("home")}}>
                        <h1 className="logo">Sandypi</h1>
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="topbar-nav" />
                    <Navbar.Collapse id="topbar-nav" className="max-width">
                        <Nav className="mr-auto">
                            <Nav.Link key={2} onClick={()=>{this.props.handleTab("drawings")}}>Drawings</Nav.Link>
                            <Nav.Link key={3} onClick={()=>{this.props.handleTab("playlists")}}>Playlists</Nav.Link>
                            <Nav.Link key={4} onClick={()=>{this.props.handleTab("manual")}}>Manual control</Nav.Link>
                            {/*<Nav.Link key={5} onClick={()=>{this.props.handleTab("leds")}}>LEDs</Nav.Link>*/}
                            {this.renderBack()}
                        </Nav>
                        <QueuePreview onClick={()=>{this.props.handleTab("queue")}}/>
                        {this.renderSettingsButton()}
                    </Navbar.Collapse>
            </Navbar>
        </div>
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(TopBar);