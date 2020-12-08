import './DrawingCard.scss';

import React, { Component } from 'react';
import { Card } from 'react-bootstrap';
import { connect } from 'react-redux';

import { getImgUrl } from '../../../utils/utils';

import { showSingleDrawing } from '../Tabs.slice';

const mapDispatchToProps = (dispatch) => {
    return { showSingleDrawing: (id) => dispatch(showSingleDrawing(id))}
}

class DrawingCard extends Component{

    render(){
        if (this.props.drawing === undefined || this.props.drawing === null)
            return "";
        return <div>
            <Card className="p-2 hover-zoom" onClick={() => this.props.showSingleDrawing(this.props.drawing.id)}>
                <div className="border-0 bg-black rounded text-dark clickable center p-0">
                    <img className="card-img-top rounded" src={getImgUrl(this.props.drawing.id)} alt="Not available"/>
                    <div className="card-img-overlay h-100 d-flex flex-column justify-content-end p-2">
                        <div className="card-text text-center text-primary p-1 glass rounded-bottom">
                            {this.props.drawing.filename}
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    }
}

export default connect(null, mapDispatchToProps)(DrawingCard);