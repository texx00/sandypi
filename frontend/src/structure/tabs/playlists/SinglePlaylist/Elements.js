import { Button, Col, Form, FormGroup, Row } from "react-bootstrap";
import { Alarm, CollectionPlay, Shuffle } from "react-bootstrap-icons";

import store from "../../../../store";
import { getImgUrl } from "../../../../utils/utils";

import Image from "../../../../components/Image";
import SquareContainer from "../../../../components/SquareContainer";
import GenericElement from "./GenericElement";

import { getPlaylistName, getPlaylists } from "../selector";
import { getDrawings } from "../../drawings/selector";
import { showSingleDrawing } from "../../Tabs.slice";

/*
 * When adding a new element should: 
 *  - create a factory in the "elementsFactory.js" file
 *  - add the element to the switch case in the "getElementClass" function at the end of this file
 *  - add the factory to the "ControlCard.js" file
 *  - add the corresponding element in the "playlist_elements.py" file
 * snake_case variables are necessary to make it compatible with the element sent to the server (using snake_case). Other js variables should be in camelCase
 */


class DrawingElement extends GenericElement{
    tip = "Click to select the drawing";
    label = "Select a drawing"
    description = <div>Select a drawing from the full list of uploaded files. It is also possible to filter them by name.</div>

    getModalOptions(){
        return [];
    }

    selectDrawingId(id){
        this.props.onOptionsChange({...this.props.element, drawing_id: id});
        this.setState({...this.state, showModal: false});
    }

    customModalOptions(){
        let drawings = getDrawings(store.getState());
        // filter by name
        if ((this.state.filterNameValue !== undefined) && (this.state.filterNameValue !== ""))
            drawings = drawings.filter((el) => {return el.filename.toLowerCase().includes(this.state.filterNameValue.toLowerCase())});

        return <div className="p-4">
            <Row>
                <Col>
                    <Button onClick={() => {
                            this.setState({...this.state, showModal: false}, () => store.dispatch(showSingleDrawing(this.props.element.drawing_id)));
                        }} 
                        className="w-100">Open the current drawing in single view</Button>
                </Col>
            </Row>
            <FormGroup as={Row} className={"mt-3"}>
                <Form.Label column sm={4}>Filter drawings by name</Form.Label>
                <Col>
                    <Form.Control value={this.state.filterNameValue} onChange={(evt) => this.setState({...this.state, filterNameValue: evt.target.value})}/>
                </Col>
            </FormGroup>
            <Row>
                {drawings.map((el, idx) => {
                    return <Col sm={4} className="p-2" key={idx}>
                        <div className="position-relative">
                            <Image className="w-100 rounded hover-light" 
                                src = {getImgUrl(el.id)} 
                                alt={"Drawing " + el.id}/>
                            <div className="image-overlay-light rounded clickable"
                                onClick={() => this.selectDrawingId(el.id)}>
                            </div>
                        </div>
                    </Col>
                })}
            </Row>
        </div>
    }

    renderElement(){
        return <Image className="w-100 rounded" 
            src = {getImgUrl(this.props.element.drawing_id)} 
            alt={"Drawing " + this.props.element.drawing_id}/>
    }
}

class CommandElement extends GenericElement{
    tip = "Click to edit the command";
    label = "Edit custom command";
    description = <div>
        <p>This elements runs custom commands. Enter the commands in the text area.</p>
        <p>It is possible to add multiple commands by separating them on multiple lines.</p>
    </div>
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

class TimingElement extends GenericElement{
    tip = "Click to change the delay or the alarm time"
    label = "Timing element";
    description = <div>
        <p>This element introduces pauses and delays between drawings.</p>
        <p>It is possible to choose between the following types:</p>
        <ul>
            <li>Delay: adds a pause between the previous and the next drawing of the set integer value (in seconds)</li>
            <li>Expiry date: you can select a date and a time. The next drawing will start only after that date</li>
            <li>Alarm time: the device will stop and wait until the next alarm time of the day before drawing the next pattern</li>
        </ul>
    </div>

    getModalOptions(){
        let type = "delay";
        let delay = "";
        let expiry_date = "";
        let alarm_time = "";
        if (this.state !== undefined){
            type = this.state.type;
            delay = this.state.delay;
            expiry_date = this.state.expiry_date;
            alarm_time = this.state.alarm_time;
        }
        else{
            type = this.props.element.type;
            delay = this.props.element.delay;
            expiry_date = this.props.element.expiry_date;
            alarm_time = this.props.element.alarm_time;
        }
        delay       = (delay !== undefined) && (type === "delay") ? delay : "";
        expiry_date = (expiry_date !== undefined) && (type === "expiry_date") ? expiry_date : "";
        alarm_time  = (alarm_time !== undefined) && (type === "alarm_time") ? alarm_time : "";

        let helper = [{field: "type",         value: type}];
        return [
            {field: "delay",        value: delay}, 
            {field: "expiry_date",  value: expiry_date}, 
            {field: "alarm_time",   value: alarm_time}, 
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
                <Row key={1}>
                    <Col>{select}</Col>
                </Row>
                {res}
            </Col>
    }

    renderElement(){
        let printTime = ""
        if (this.state.type === "delay")
            printTime = "Delay: " + Math.round(this.state.delay) + "s";
        else if (this.state.type === "expiry_date")
            printTime = "Expires on: \n" + this.state.expiry_date;
        else if (this.state.type === "alarm_time")
            printTime = "Alarm at: " + this.state.alarm_time;
        return <SquareContainer>
            <div>
                <Row><Col className="text-primary pb-3"><Alarm/>  Timing element</Col></Row>
                <Row><Col>{printTime.split("\n").map((l,idx) => {return <p key={idx}>{l}</p>})}</Col></Row>
            </div>
        </SquareContainer>
    }

    renderPreview(){
        return <Alarm className="text-primary"/>
    }
}

class ShuffleElement extends GenericElement{
    tip = "Click to select from where to select a random drawing";
    label = "Shuffle element";
    description = <div>
        <p>This element is substituted by a random drawing selected from:</p>
        <ul>
            <li>the entire list of uploaded drawings</li>
            or
            <li>the drawings of the current playlist</li>
        </ul>
    </div>

    getModalOptions(){
        return [
            {type: "select", options: [{value: 0, label: "All the uploaded drawings"}, {value: 1, label: "This playlist only"}], field: "shuffle_type", value: this.props.element.shuffle_type, label: "Select where to select the drawing from"},
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

class StartPlaylistElement extends GenericElement{
    tip = "Click to select a playlist"
    label = "Start a playlist element";
    description = <div>
        <p>This element allows to start another playlist. Can also be used to start the same playlist to create a loop.</p>
    </div>

    getModalOptions(){
        let vals = getPlaylists(store.getState()).map((pl) => {return {value: pl.id, label:pl.name};});
        return [{
            type:      "select", 
            options:    vals, 
            field:      "playlist_id", value: this.props.playlist_id, 
            label:      "Select the playlist to start"
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
        return GenericElement;
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
            return GenericElement;
    }
}

export {DrawingElement, CommandElement, TimingElement, ShuffleElement, StartPlaylistElement, getElementClass};