import React, { Component, createElement } from 'react';
import { Col } from 'react-bootstrap';

import UploadDrawingsModal from '../../drawings/UploadDrawing';
import { create_drawing_element } from '../elements';

class ControlCard extends Component{
    constructor(props){
        super(props);
        this.state = {
            show_upload: false
        }
    }

    render(){
        return <Col sm={4} id="control_card" className="nodrag">
                <div className="card hover-zoom"
                    onClick={() => this.setState({show_upload: true})}>
                    <div className="pb100"></div>
                    <div className="position-absolute h-100 w-100 control-card pt-5 center">Add new drawing</div>
                </div>

                <UploadDrawingsModal key={2}
                    playlist={this.props.playlistId}
                    show={this.state.show_upload}
                    handleClose={()=>{this.setState({show_upload: false})}}
                    handleFileUploaded={(ids) => {
                        this.props.onElementsAdded(ids.map((id)=>{
                            return create_drawing_element(id);
                        }));
                    }}/>
            </Col>
    }
}

export default ControlCard;