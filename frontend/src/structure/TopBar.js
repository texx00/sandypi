import React, { Component } from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import { ChevronCompactLeft, Sliders } from 'react-bootstrap-icons';
import { connect } from 'react-redux';
import IconButton from '../components/IconButton';

import { showBack } from './tabs/selector';
import { setTab, tabBack } from './tabs/Tabs.slice';

const mapStateToProps = (state) => {
    return { show_back: showBack(state) }
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
            return <Nav.Link key={5} className="text-bold" onClick={()=>{this.props.handleTabBack()}}><ChevronCompactLeft/>Back</Nav.Link>
        else return "";
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
                            <Nav.Link key={1} onClick={()=>{this.props.handleTab("home")}}>Home</Nav.Link>
                            <Nav.Link key={2} onClick={()=>{this.props.handleTab("drawings")}}>Drawings</Nav.Link>
                            <Nav.Link key={3} onClick={()=>{this.props.handleTab("playlists")}}>Playlists</Nav.Link>
                            <Nav.Link key={4} onClick={()=>{this.props.handleTab("manual")}}>Manual control</Nav.Link>
                            {this.renderBack()}
                        </Nav>
                        <IconButton className="btn btn-dark" 
                            onClick={()=>{this.props.handleTab("settings")}}
                            icon={Sliders}>
                                Settings
                        </IconButton>
                    </Navbar.Collapse>
            </Navbar>
        </div>
    }
}
// TODO add linux shutdown/restart

export default connect(mapStateToProps, mapDispatchToProps)(TopBar);