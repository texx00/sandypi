import React, { Component } from 'react';

// make the card as a square
class SquareContainer extends Component{
    render(){
        return <div className="d-flex" {...this.props}>
                <div className="pb100"></div>
                <div className="position-absolute h-100 w-100 control-card rounded">
                    <div className="position-relative d-flex h-100 w-100 align-items-center center rounded">
                        {this.props.children}
                    </div>
                </div>
            </div>
    }
}

export default SquareContainer;