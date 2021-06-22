import { Component } from 'react';
import { Button } from 'react-bootstrap';

import "../App.scss";

class IconButton extends Component{

    render(){
        let iconProps = this.props.iconLarge === "true" ? {width: "32", height: "32"} : {};
        iconProps = this.props.iconMedium === "true" ? {width: "20", height: "20"} : iconProps;
        
        let iconExtraClass = this.props.iconLarge === "true" ? "m-2" : "";
        if (this.props.children === undefined || this.props.children === "")
            iconExtraClass = "no-margin";
        let icon = this.props.icon !== undefined ? <this.props.icon className={iconExtraClass+" icon"} {...iconProps}/> : "";
        let text = this.props.children !== undefined ? <span className="align-self-center">{this.props.children}</span> : undefined;
        if (this.props.children !== undefined && this.props.children !== "")
            return <Button className={this.props.className} onClick={(evt) => {if (this.props.onClick !== undefined) this.props.onClick(evt);}}>
                <div className="d-flex">
                    {icon}
                    {text}
                </div>
            </Button>
        else return <Button className={this.props.className} onClick={(evt) => {if (this.props.onClick !== undefined) this.props.onClick(evt);}}>
            <div className="d-flex">
                {icon}
            </div>
        </Button>
    }

}

export default IconButton;