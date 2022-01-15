import React, { Component } from 'react';
import {Navbar, Nav} from 'react-bootstrap';
import { home_site } from '../utils/utils';

class Footer extends Component{
    render(){
        return <footer >
            <Navbar bg="primary" collapseOnSelect expand="lg" className="center">
                <Navbar.Toggle aria-controls="footer-nav" />
                <Navbar.Collapse id="footer-nav" className="max-width">
                    <Nav className="mr-auto">
                        Copyright © 2020
                    </Nav>
                    <Nav>
                        For more detail visit the project homepage on  <a className="ml-1" href={home_site} rel="noreferrer" target="_blank">GitHub</a>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        </footer>
    }
}

export default Footer;