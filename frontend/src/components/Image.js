import React, { Component } from 'react';
import { Spinner } from 'react-bootstrap';

class Image extends Component{
    constructor(props){
        super(props);
        this.state = { error: false, height: 0 };
        this.imageRef = React.createRef();
        this.divRef = React.createRef();
    }

    onError(){
        this.setState({...this.state, error: true});
        setTimeout(this.retryImage.bind(this), 1000);   // try to reload the image after a while
    }

    retryImage(){
        fetch(this.props.src).then((response)=>{
            if (response.ok){
                this.setState({...this.state, error: false});
            }else{
                setTimeout(this.retryImage.bind(this),1000);
            }
        });
    }

    componentDidUpdate(){
        if (this.state.error){
            if(this.divRef.current){
                if (this.divRef.current.offsetWidth !== 0){
                    let h = parseInt(getComputedStyle(this.divRef.current).height.replace("px", ""))
                    if(Math.abs(h-this.divRef.current.offsetWidth)>10){ // for some reason is not setting exactly the same value
                        this.setState({...this.state, height: this.divRef.current.offsetWidth});
                    }
                }
            }
        }
    }

    render(){
        if (this.state.error)
            return <div className={this.props.className + " w-100"} ref={this.divRef} style={{height: this.state.height}}>
                    <div className="position-relative w-100 h-100 center">
                        <Spinner animation="border" className={this.props.noMargin==="true" ? "" : "m-5"}/>
                    </div>
                </div>
        else return <img {...this.props} alt={this.props.alt} onError={this.onError.bind(this)}/>
    }
}

export default Image;