import { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Button } from 'react-bootstrap';

import { tabBack } from '../Tabs.slice';
import { getSinglePlaylist } from './selector';

const mapStateToProps = (state) => {
    return { playlist: getSinglePlaylist(state) };
}

const mapDispatchToProps = (dispatch) => {
    return {
        handleTabBack: () => dispatch(tabBack())
    }
}

class SinglePlaylist extends Component{


    render(){
        return <Container>
            <div>
                <Button onClick={()=>{this.props.handleTabBack()}}>BACK</Button>
                
            </div>

        </Container>
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SinglePlaylist);