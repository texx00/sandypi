import React, { Component } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FileEarmarkPlus } from 'react-bootstrap-icons';
import { connect } from 'react-redux';

import { Section } from '../../../components/Section';
import PlayContinuous from '../../../components/PlayContinuous';

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
        this.state = {showUpload: false, loaded: false}
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
                        <DrawingCard drawing={d}/>
                    </Col>
            });
        else{
            return <div></div>
        }
    }

    render(){
        return <Container>
            <Section sectionTitle="Drawings"
                sectionButton="Upload new drawing"
                buttonIcon={FileEarmarkPlus}
                sectionButtonHandler={()=>this.setState({showUpload: true})}>
            
                <PlayContinuous />

                <Row>
                    {this.renderDrawings(this.props.drawings)}
                </Row>

                <UploadDrawingsModal key={2}
                    show={this.state.showUpload}
                    handleClose={()=>{this.setState({showUpload: false})}}
                    handleFileUploaded={this.handleFileUploaded.bind(this)}/>
                </Section>
        </Container>
    }
}

// TODO possibility to create elements instead of loading drawings. This will allow to share same elements between different playlists

export default connect(mapStateToProps, mapDispatchToProps)(Drawings);