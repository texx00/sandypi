import React, { Component } from 'react';

import Section from '../../components/Section.js';
import PlaceholderCard from '../../components/PlaceholderCard.js';

import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';

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

    }

    uploadDrawingHandler(){
        // TODO
        console.log("Upload drawing");
    }

    newPlaylistHandler(){
        console.log("Create playlist")
    }


    render(){
        return <div>
            <Section sectionTitle="Drawings"
                sectionButton="+ Upload new drawing"
                sectionButtonHandler={this.uploadDrawingHandler.bind(this)}>
                    <Carousel responsive={this.carousel_responsive} ssr>
                        {[1,2,3,4,5,6,7].map((item, index)=>{
                            return  <PlaceholderCard key={index}/>})}
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
        </div>
    }
}

export default Home;