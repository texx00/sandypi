import { Component } from 'react';
import { connect } from 'react-redux';

import { getRefreshDrawings } from '../structure/tabs/drawings/selector';
import { setDrawings, setRefreshDrawing } from '../structure/tabs/drawings/Drawings.slice';

import { drawings_request } from '../sockets/sEmits';
import { drawings_refresh_response} from '../sockets/sCallbacks';

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
        drawings_refresh_response(this.onDataReceived.bind(this));
        this.requestDrawings();
    }
    
    requestDrawings(){
        drawings_request();
    }

    onDataReceived(res){
        this.props.setDrawings(JSON.parse(res));
    }

    render(){
        if (this.props.must_refresh){
            this.props.setRefreshFalse();
            this.requestDrawings();
        }
        return null;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(DrawingDataDownloader);