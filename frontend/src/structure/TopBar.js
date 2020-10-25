import React, {Component} from 'react';
import {Navbar, Nav, Button} from 'react-bootstrap';

class TopBar extends Component{

    render(){
        return <div>
            
            <Navbar bg="primary" collapseOnSelect expand="lg" sticky="top" className="center">
                    <Navbar.Brand href="#home"><h1 className="logo">Sandypi</h1></Navbar.Brand>
                    <Navbar.Toggle aria-controls="topbar-nav" />
                    <Navbar.Collapse id="topbar-nav" className="max-width">
                        <Nav className="mr-auto">
                            <Nav.Link onClick={()=>{this.props.handleTab("home")}}>Home</Nav.Link>
                            <Nav.Link onClick={()=>{this.props.handleTab("drawings")}}>Drawings</Nav.Link>
                            <Nav.Link onClick={()=>{this.props.handleTab("playlists")}}>Playlists</Nav.Link>
                            <Nav.Link onClick={()=>{this.props.handleTab("manual")}}>Manual control</Nav.Link>
                        </Nav>
                        <Button className="btn btn-dark" onClick={()=>{this.props.handleTab("settings")}}>Settings</Button>
                    </Navbar.Collapse>
            </Navbar>
        </div>
    }
}

export default TopBar;