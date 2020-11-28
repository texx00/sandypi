import { Component } from 'react';
import { connect } from 'react-redux';

import { api_url } from "../project_defaults";

import { getRefreshDrawings } from '../structure/tabs/drawings/selector';
import { setDrawings, setRefreshDrawing } from '../structure/tabs/drawings/Drawings.slice';

const mapStateToProps = (state) => {
    return { must_refresh: getRefreshDrawings(state) }
}

const mapDispatchToProps = (dispatch) => {
    return {
        setDrawings: (drawings) => dispatch(setDrawings(drawings)),
        setRefreshFalse: () => dispatch(setRefreshDrawing(false))
    }
}

class DrawingDataDownloader extends Component{

    componentDidMount(){
        this.requestDrawings();
    }
    
    requestDrawings(){
        fetch(api_url+"/drawings/")
        .then(response => response.json())
        .then(data => {
            if (data !== undefined)
                this.props.setDrawings(data);
        }).catch(error => {
            console.log("There was an error");
            console.log(error);
        })
    }

    render(){
        if (this.props.must_refresh){
            this.requestDrawings();
            this.props.setRefreshFalse();
        }
        return null;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(DrawingDataDownloader);