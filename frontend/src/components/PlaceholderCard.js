import React, { Component } from 'react';

import {Card} from 'react-bootstrap';

class PlaceholderCard extends Component{

    //TODO a placeholder image instead of the text
    render(){
        return <Card className="p-2">
                <div className="border-0 bg-black rounded text-dark clickable hover-zoom center square">
                    <div className="">Loading...</div>
                </div>
            </Card>
    }
}

export default PlaceholderCard;