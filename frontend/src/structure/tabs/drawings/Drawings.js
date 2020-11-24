import React, { Component } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';

import { Section } from '../../../components/Section';

import DrawingDataDownloader from './DrawingDataDownloader';
import UploadDrawingsModal from './UploadDrawing';
import DrawingCard from './DrawingCard';
import { setDrawings } from './Drawings.slice';

const mapDispatchToProps = (dispatch) => {
    return {setDrawings: (drawings) => dispatch(setDrawings(drawings))}
}

class Drawings extends Component{
    constructor(props){
        super(props);
        this.state = {show_upload: false, loaded: false, drawings: []}
        this.dhandler = new DrawingDataDownloader(this.addElements.bind(this));
    }

    componentDidMount(){
        this.dhandler.requestDrawings();
    }

    addElements(data){
        this.setState({drawings: data, loaded: true});
        this.props.setDrawings(data);
    }

    handleFileUploaded(){
        this.dhandler.requestDrawings();
    }

    renderDrawings(drawings){
        return drawings.map((d, index)=>{
            return <Col key={index} sm={4}>
                    <DrawingCard element={d} handleDelete={(id)=>{
                        console.log("remove id")
                    }}/>
                </Col>
        });
    }
    // todo load more on page scroll

    render(){
        return <Container>
                <Row>
                    <Col>
                        <Section sectionTitle="Drawings"
                            sectionButton="+ Upload new drawing"
                            sectionButtonHandler={()=>this.setState({show_upload: true})}>
                    
                        <div className={(this.state.loaded ? " d-none" : "")}>
                            <div className="w-100 pt-5 center">
                                <h1>Loading...</h1>
                            </div>
                        </div>
                        
                        <Row>
                                {this.renderDrawings(this.state.drawings)}
                            </Row>

                        <UploadDrawingsModal key={2}
                            show={this.state.show_upload}
                            handleClose={()=>{this.setState({show_upload: false})}}
                            handleFileUploaded={this.handleFileUploaded.bind(this)}/>
                        </Section>
                    </Col>
                </Row>
        </Container>
    }
}

export default connect(null, mapDispatchToProps)(Drawings);