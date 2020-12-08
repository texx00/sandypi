import { Component } from 'react';
import { Button } from 'react-bootstrap';

class IconButton extends Component{

    render(){
        let icon = this.props.icon !== undefined ? <this.props.icon className="icon"/> : "";

        return <Button className={this.props.className} onClick={(evt) => {if (this.props.onClick !== undefined) this.props.onClick(evt);}}>
            <div className="d-flex">
                {icon}
                <span className="align-self-center">{this.props.children}</span>
            </div>
        </Button>
    }

}

export default IconButton;