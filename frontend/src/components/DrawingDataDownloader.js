import { Component } from 'react';
import { connect } from 'react-redux';

import { getRefreshDrawings } from '../structure/tabs/drawings/selector';
import { setDrawings, setRefreshDrawing } from '../structure/tabs/drawings/Drawings.slice';

import { drawingsRequest } from '../sockets/sEmits';
import { drawingsRefreshResponse} from '../sockets/sCallbacks';

const mapStateToProps = (state) => {
    return { mustRefresh: getRefreshDrawings(state) }
}

const mapDispatchToProps = (dispatch) => {
    return {
        setDrawings: (drawings) => dispatch(setDrawings(drawings)),
        setRefreshFalse: () => dispatch(setRefreshDrawing(false))
    }
}

class DrawingDataDownloader extends Component{

    componentDidMount(){
        drawingsRefreshResponse(this.onDataReceived.bind(this));
        this.requestDrawings();
    }
    
    requestDrawings(){
        drawingsRequest();
    }

    onDataReceived(res){
        this.props.setDrawings(JSON.parse(res));
    }

    render(){
        if (this.props.mustRefresh){
            this.props.setRefreshFalse();
            this.requestDrawings();
        }
        return null;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(DrawingDataDownloader);