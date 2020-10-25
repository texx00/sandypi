import React, { Component } from 'react';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';

import { Section } from '../../components/Section.js';
import PlaceholderCard from '../../components/PlaceholderCard.js';

import UploadDrawingsModal from './drawings/UploadDrawing.js';
import DrawingCard from './drawings/DrawingCard';
import DrawingDataDownloader from './drawings/DrawingDataDownloader';

class Home extends Component{
    constructor(props){
        super(props);
        this.carousel_responsive = {
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
        this.state = {show_upload: false, show_create_playlist: false, elements: []}
        this.dhandler = new DrawingDataDownloader(this.setElements.bind(this));
    }

    componentDidMount(){
        this.dhandler.requestDrawings();
    }

    handleFileUploaded(){
        this.dhandler.requestDrawings();
        window.show_toast("Updating drawing previews...");
    }


    setElements(elements){
        this.setState({elements : elements});
    }

    newPlaylistHandler(){
        console.log("Create playlist")
    }

    renderDrawings(list){
        let result; 
        if (list.length>0){
            result = list.map((item, index) => {return <DrawingCard element={item} key={index}/>});
        }else{
            result = [1,2,3,4,5,6,7].map((item, index)=>{return  <PlaceholderCard key={index}/>});
        }
        return result;
    }

    render(){
        return <div>
            <Section sectionTitle="Drawings"
                sectionButton="+ Upload new drawing"
                sectionButtonHandler={()=>this.setState({show_upload: true})}>
                    <Carousel responsive={this.carousel_responsive} ssr>
                        {this.renderDrawings(this.state.elements)}
                    </Carousel>
            </Section>
            <Section sectionTitle="Playlists"
                sectionButton="+ Create new playlist"
                sectionButtonHandler={this.newPlaylistHandler.bind(this)} ssr>
                    <Carousel responsive={this.carousel_responsive}>
                        {[1,2,3,4].map((item, index)=>{
                            return <PlaceholderCard key={index}/>
                        })}
                    </Carousel>
            </Section>
            <UploadDrawingsModal 
                show={this.state.show_upload}
                handleClose={()=>{this.setState({show_upload: false})}}
                handleFileUploaded={this.handleFileUploaded.bind(this)}/>
        </div>
    }
}

export default Home;