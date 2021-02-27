import { Col, Form, Row } from "react-bootstrap";
import { Alarm, CollectionPlay, Shuffle } from "react-bootstrap-icons";

import store from "../../../../store";
import { getImgUrl } from "../../../../utils/utils";

import Image from "../../../../components/Image";
import SquareContainer from "../../../../components/SquareContainer";

import BasicElement from "./BasicElement";
import { getPlaylistName, getPlaylists } from "../selector";

/*
 * When adding a new element should: 
 *  - create a factory in the "elementsFactory.js" file
 *  - add the element to the switch case in the "getElementClass" function at the end of this file
 *  - add the factory to the "ControlCard.js" file
 *  - add the corresponding element in the "playlist_elements.py" file
 */


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
                    <Row><Col>{lines.map((el, idx) => { return <Row key={idx}><Col>{el}</Col></Row>})}</Col></Row>
                </div>
            </SquareContainer>
    }

    renderPreview(){
        return "G";
    }
}

class TimingElement extends BasicElement{
    tip = "Click to change the delay or the alarm time"
    label = "Timing element";

    getModalOptions(){
        let type = "delay";
        if (this.state !== undefined)
            type = this.state.type;
        else type = this.props.element.type;

        let helper = [{field: "type",         value: type}];

        return [
            {field: "delay",        value: (this.type==="delay"         ? this.props.element.delay          : "")}, 
            {field: "expiry_date",  value: (this.type==="expiry_date"   ? this.props.element.expiry_date    : "")}, 
            {field: "alarm_time",   value: (this.type==="alarm_time"    ? this.props.element.alarm_time     : "")}, 
            ...helper
        ];
    }

    customModalOptions(){
        let select = <Form.Group>
                <Form.Label>Timing type</Form.Label>
                <Form.Control as="select"
                    value={this.state.type}
                    onChange={(evt) => this.onOptionChange(evt.target.value, {field: "type"})}>
                        <option key={1} value={"delay"}>Delay</option>
                        <option key={2} value={"expiry_date"}>Expiry date</option>
                        <option key={3} value={"alarm_time"}>Alarm time</option>
                </Form.Control>
            </Form.Group>
        let res = "";
        if (this.state.type === "delay")
            res = <Row>{this.renderSingleOption({field: "delay", value: this.state.delay, label: "Insert the delay value in seconds"},2)}</Row>
        else if (this.state.type === "expiry_date")
            res = <Row>{this.renderSingleOption({field: "expiry_date", value: this.state.expiry_date, type: "datetime"},2)}</Row>
        else if (this.state.type === "alarm_time")
            res = <Row>{this.renderSingleOption({field: "alarm_time", value: this.state.alarm_time, type: "time", label: "Select at what time to start the next drawing"},2)}</Row>
        return <Col>
                <Row>
                    <Col key={1}>{select}</Col>
                </Row>
                {res}
            </Col>
    }

    renderElement(){
        let print_time = ""
        if (this.props.element.delay !== "")
            print_time = "Delay: " + this.props.element.delay + "s";
        else if (this.props.element.expiry_date)
            print_time = "Expires on: \n" + this.props.element.expiry_date;
        else if (this.props.element.alarm_time)
            print_time = "Alarm at: " + this.props.element.alarm_time;
        return <SquareContainer>
            <div>
                <Row><Col className="text-primary pb-3"><Alarm/>  Timing element</Col></Row>
                <Row><Col>{print_time.split("\n").map(l => {return <p>{l}</p>})}</Col></Row>
            </div>
        </SquareContainer>
    }

    renderPreview(){
        return <Alarm className="text-primary"/>
    }
}

class ShuffleElement extends BasicElement{
    tip = "Click to select from where to select the random drawing"
    label = "Shuffle element";

    getModalOptions(){
        return [
            {type: "select", options: [{value: 0, label: "All the drawings"}, {value: 1, label: "This playlist"}], field: "shuffle_type", value: this.props.element.shuffle_type, label: "Select where to select the drawing from"},
            {field: "playlist_id", value: this.props.element.playlist_id, hidden: true}
        ]
    }

    renderElement(){
        return <SquareContainer>
            <div>
                <Row><Col className="text-primary pb-3"><Shuffle/> Random drawing</Col></Row>
                <Row><Col>{this.props.element.shuffle_type==="0" ? "From the entire library" : "From the playlist"}</Col></Row>
            </div>
        </SquareContainer>
    }

    renderPreview(){
        return <Shuffle className="text-primary"/>
    }
}

class StartPlaylistElement extends BasicElement{
    tip = "Click to select a playlist"
    label = "Start a playlist element";

    getModalOptions(){
        let vals = getPlaylists(store.getState()).map((pl) => {return {value: pl.id, label:pl.name};});
        return [{
            type:      "select", 
            options:    vals, 
            field:      "playlist_id", value: this.props.playlist_id, 
            label:      "Select playlist to start"
        }]
    }

    renderElement(){
        return <SquareContainer>
            <div>
                <Row><Col className="text-primary pb-3"><CollectionPlay/> Start a playlist</Col></Row>
                <Row><Col>Playlist: {getPlaylistName(store.getState(), this.props.element.playlist_id)}</Col></Row>
            </div>
        </SquareContainer>
    }

    renderPreview(){
        return <CollectionPlay className="text-primary"/>
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
        case "timing":
            return TimingElement;
        case "shuffle":
            return ShuffleElement;
        case "start_playlist":
            return StartPlaylistElement;
        default:
            return BasicElement;
    }
}

export {DrawingElement, CommandElement, TimingElement, ShuffleElement, StartPlaylistElement, getElementClass};