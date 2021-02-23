import { Component } from 'react';
import { Button } from 'react-bootstrap';

class IconButton extends Component{

    render(){
        let iconProps = this.props.iconLarge === "true" ? {width: "32", height: "32"} : {};
        let iconExtraClass = this.props.iconLarge === "true" ? "m-2" : "";
        let icon = this.props.icon !== undefined ? <this.props.icon className={"icon "+iconExtraClass} {...iconProps}/> : "";
        let text = this.props.children !== undefined ? <span className="align-self-center">{this.props.children}</span> : undefined;
        return <Button className={this.props.className} onClick={(evt) => {if (this.props.onClick !== undefined) this.props.onClick(evt);}}>
            <div className="d-flex">
                {icon}
                {text}
            </div>
        </Button>
    }

}

export default IconButton;