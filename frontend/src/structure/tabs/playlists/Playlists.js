import React, { Component } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { PlusSquare } from 'react-bootstrap-icons';
import { connect } from 'react-redux';

import { Section } from '../../../components/Section';
import { showSinglePlaylist } from '../Tabs.slice';
import PlaylistCard from './PlaylistCard';
import { getPlaylists } from './selector';

const mapStateToProps = (state) => {
    return { 
        playlists: getPlaylists(state)
     }
}

const mapDispatchToProps = (dispatch) => {
    return {
        createNewPlaylist: () => dispatch(showSinglePlaylist(0))
    }
}

class Playlists extends Component{

    createPlaylistHandler(){
        this.props.createNewPlaylist();
    }

    renderPlaylists(){
        if (this.props.playlists.length > 0){
            return this.props.playlists.map((item, index)=>{
                return <Col  
                    key={index}>
                    <PlaylistCard 
                        playlist={item}/>
                </Col>
            });
        }else{
            return <Col>
                    <Button onClick={this.createPlaylistHandler.bind(this)}>You didn't create any playlist yet. Start by creating one.</Button>
                </Col>
        }
    }
    
    render(){
        return <Container>
            <Section sectionTitle="Playlists"
                sectionButton={<div className="d-flex">
                        <PlusSquare className="mr-2 align-self-center"/>
                        <span className="align-self-center">Create new playlist</span>
                    </div>}
                sectionButtonHandler={this.createPlaylistHandler.bind(this)}>
                    <Row>
                        {this.renderPlaylists()}
                    </Row>
            </Section>
        </Container>
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Playlists);