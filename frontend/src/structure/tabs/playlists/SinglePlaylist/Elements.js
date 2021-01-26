import Image from "../../../../components/Image";
import SquareContainer from "../../../../components/SquareContainer";
import { getImgUrl } from "../../../../utils/utils";
import BasicElement from "./BasicElement";


class DrawingElement extends BasicElement{
    renderElement(){
        return <Image className="w-100 rounded" 
            src = {getImgUrl(this.props.element.drawing_id)} 
            alt={"Drawing "+this.props.element.drawing_id}/>
    }
}

class CommandElement extends BasicElement{
    tip = "Click to edit the command"
    label = "Edit custom command"

    getModalOptions(){
        return [{type: "textarea", field: "command", value: this.props.element.command, label: "Enter commands"}];
    }

    renderElement(){
        return <SquareContainer>
                <div>
                    Custom command
                    {this.props.element.command}
                </div>
            </SquareContainer>
    }
}

export {DrawingElement, CommandElement};