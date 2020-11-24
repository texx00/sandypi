import './DrawingCard.scss';

import React, { Component } from 'react';
import { Card } from 'react-bootstrap';
import { connect } from 'react-redux';

import { static_url } from '../../../project_defaults';

import { showSingleDrawing } from '../Tabs.slice';

const mapDispatchToProps = (dispatch) => {
    return { showSingleDrawing: (id) => dispatch(showSingleDrawing(id))}
}

class DrawingCard extends Component{
    constructor(props){
        super(props);
        this.state = {show_details: false};
    }

    getImgUrl(){
        return static_url + "/Drawings/" + this.props.element.id + "/" + this.props.element.id + ".jpg";
    }

    render(){
        return <div>
            <Card className="p-2 hover-zoom" onClick={() => this.props.showSingleDrawing(this.props.element.id)}>
                <div className="border-0 bg-black rounded text-dark clickable center p-0">
                    <img className="card-img-top rounded" src={this.getImgUrl()} alt="Not available"/>
                    <div className="card-img-overlay h-100 d-flex flex-column justify-content-end p-2">
                        <div className="card-text text-center text-dark p-1 fade-top"></div>
                        <div className="card-text text-center text-dark pb-1 bg-primary rounded-bottom">
                            {this.props.element.filename}
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    }
}

export default connect(null, mapDispatchToProps)(DrawingCard);