import { Col, Row } from "react-bootstrap";

import { getImgUrl } from "../../../../utils/utils";

import Image from "../../../../components/Image";
import SquareContainer from "../../../../components/SquareContainer";

import BasicElement from "./BasicElement";


class DrawingElement extends BasicElement{
    renderElement(){
        return <Image className="w-100 rounded" 
            src = {getImgUrl(this.props.element.drawing_id)} 
            alt={"Drawing "+this.props.element.drawing_id}/>
    }
}

class CommandElement extends BasicElement{
    tip = "Click to edit the command";
    label = "Edit custom command";
    MAX_ROW_NUMBER = 4;

    getModalOptions(){
        return [{type: "textarea", field: "command", value: this.props.element.command, label: "Enter commands"}];
    }

    renderElement(){
        let lines = this.props.element.command.replace("\r", "").split("\n");
        if (lines.length > this.MAX_ROW_NUMBER){
            lines = lines.slice(0, this.MAX_ROW_NUMBER);
            lines.push("...");
        }

        return <SquareContainer>
                <div>
                    <Row><Col className="text-primary">Custom command</Col></Row>
                    <Row><Col>{lines.map((el) => { return <Row><Col>{el}</Col></Row>})}</Col></Row>
                </div>
            </SquareContainer>
    }
}

function getElementClass(element){
    if (element === undefined)
        return BasicElement;
    switch (element.element_type){ 
        case "command":
            return CommandElement;
        case "drawing":
            return DrawingElement;
        default:
            return BasicElement;
    }
}

export {DrawingElement, CommandElement, getElementClass};