import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { FileEarmarkPlus, PlusSquare } from 'react-bootstrap-icons';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';

import { Section } from '../../components/Section';
import PlaceholderCard from '../../components/PlaceholderCard';

import UploadDrawingsModal from './drawings/UploadDrawing';
import DrawingCard from './drawings/DrawingCard';
import PlaylistCard from './playlists/PlaylistCard';

import { playlistCreateNew } from '../../sockets/sEmits';

import { getDrawingsLimited } from './drawings/selector';
import { getPlaylistsLimited } from './playlists/selector';
import { setRefreshDrawing } from './drawings/Drawings.slice';
import { setTab } from './Tabs.slice';
import { setShowNewPlaylist } from './playlists/Playlists.slice';

const mapStateToProps = (state) => {
    return { 
        drawings:   getDrawingsLimited(state),
        playlists:  getPlaylistsLimited(state)
     }
}

const mapDispatchToProps = (dispatch) => {
    return {
        setRefreshDrawing:      () => dispatch(setRefreshDrawing(true)),
        handleTab:          (name) => dispatch(setTab(name)),
        setShowNewPlaylist:     () => dispatch(setShowNewPlaylist(true))
    }
}

class Home extends Component{
    constructor(props){
        super(props);
        this.carouselResponsive = {
            largeDesktop: {
              breakpoint: { max: 4000, min: 3000 },
              items: 5
            },
            desktop: {
              breakpoint: { max: 3000, min: 1024 },
              items: 3
            },
            tablet: {
              breakpoint: { max: 1024, min: 464 },
              items: 2
            },
            mobile: {
              breakpoint: { max: 464, min: 0 },
              items: 1
            }
        };
        this.state = {
            showUpload: false
        }
    }

    handleFileUploaded(){
        window.showToast("Updating drawing previews...");
        this.props.setRefreshDrawing();
    }

    renderDrawings(list){
        let result;
        if (list.length>0){
            result = list.map((item, index) => {
                return <DrawingCard 
                    drawing={item} 
                    key={index} />});
        }else{
            result = [1,2,3,4,5,6,7].map((item, index)=>{return  <PlaceholderCard key={index}/>});
        }
        return result;
    }

    renderPlaylists(list){
        let result;
        if (list.length>0){
            result = list.map((item, index) => {
                return <PlaylistCard
                    playlist={item} 
                    key={index}/>});
                    
            result = <Carousel responsive={this.carouselResponsive}>
                {result}
            </Carousel>
        }else{
            result = <div className="center w-100">
                    <Button onClick={()=> { 
                            this.props.setShowNewPlaylist();
                            playlistCreateNew();
                        }}>
                        Start by creating a new playlist now
                    </Button>
                </div>
        }
        return result;
    }

    render(){
        return <Container>
            <Row>
                <Col>
                    <Section sectionTitle="Drawings"
                        sectionButton="Upload new drawing"
                        buttonIcon={FileEarmarkPlus}
                        sectionButtonHandler={()=>this.setState({showUpload: true})}
                        titleButtonHandler={()=>this.props.handleTab("drawings")}>
                            <Carousel responsive={this.carouselResponsive} ssr>
                                {this.renderDrawings(this.props.drawings)}
                            </Carousel>
                    </Section>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Section sectionTitle="Playlists"
                        sectionButton="Create new playlist"
                        buttonIcon={PlusSquare}
                        sectionButtonHandler={()=> {
                            this.props.setShowNewPlaylist();
                            playlistCreateNew();
                        }}
                        titleButtonHandler={()=>this.props.handleTab("playlists")}
                        ssr>
                            {this.renderPlaylists(this.props.playlists)}
                    </Section>
                </Col>
            </Row>
            <UploadDrawingsModal 
                show={this.state.showUpload}
                handleClose={()=>{this.setState({showUpload: false})}}
                handleFileUploaded={this.handleFileUploaded.bind(this)}/>
        </Container>
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);