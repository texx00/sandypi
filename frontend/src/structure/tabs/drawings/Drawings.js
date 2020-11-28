import React, { Component } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';

import { Section } from '../../../components/Section';

import UploadDrawingsModal from './UploadDrawing';
import DrawingCard from './DrawingCard';

import { setRefreshDrawing } from './Drawings.slice';
import { getDrawings } from './selector';

const mapStateToProps = (state) => {
    return { drawings: getDrawings(state) }
}

const mapDispatchToProps = (dispatch) => {
    return {setRefreshDrawing: () => dispatch(setRefreshDrawing(true))}
}

class Drawings extends Component{
    constructor(props){
        super(props);
        this.state = {show_upload: false, loaded: false}
    }

    componentDidMount(){
        if (this.props.drawings.length > 0){
            this.setState({loaded: true});
        }
    }

    handleFileUploaded(){
        this.props.setRefreshDrawing();
        this.setState({loaded: true});
    }

    renderDrawings(drawings){
        if (drawings !== undefined)
            return drawings.map((d, index)=>{
                return <Col key={index} sm={4}>
                        <DrawingCard drawing={d} handleDelete={(id)=>{
                            console.log("remove id")
                        }}/>
                    </Col>
            });
        else{
            return <div></div>
        }
    }
    // TODO load more on page scroll

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
                                {this.renderDrawings(this.props.drawings)}
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

export default connect(mapStateToProps, mapDispatchToProps)(Drawings);