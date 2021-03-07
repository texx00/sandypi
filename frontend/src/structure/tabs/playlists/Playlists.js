import React, { Component } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { PlusSquare } from 'react-bootstrap-icons';
import { connect } from 'react-redux';

import { Section } from '../../../components/Section';
import { playlistCreateNew } from '../../../sockets/sEmits';
import PlaylistCard from './PlaylistCard';
import { setShowNewPlaylist } from './Playlists.slice';
import { getPlaylists } from './selector';

const mapStateToProps = (state) => {
    return { 
        playlists: getPlaylists(state)
     }
}

const mapDispatchToProps = (dispatch) => {
    return {
        setShowNewPlaylist: () => dispatch(setShowNewPlaylist(true))
    }
}

class Playlists extends Component{

    createPlaylistHandler(){
        this.props.setShowNewPlaylist();
        playlistCreateNew();
    }

    renderPlaylists(){
        if (this.props.playlists.length > 0){
            return this.props.playlists.map((item, index)=>{
                return <Col sm={4}
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
                sectionButton="Create new playlist"
                buttonIcon={PlusSquare}
                sectionButtonHandler={this.createPlaylistHandler.bind(this)}>
                    <Row>
                        {this.renderPlaylists()}
                    </Row>
            </Section>
        </Container>
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Playlists);