import { Component } from 'react';
import { Col, Form } from 'react-bootstrap';

class FormDatetime extends Component{
    constructor(props){
        super(props);
        if (this.props.value !== undefined){
            let val = this.props.value.split(" ");
            if (val.length===2)
                this.state = {date: val[0], time: val[1]};
            else this.state = {date: "", time: ""};
        }else this.state = {date: "", time: ""};
    }

    updateDate(evt){
        Promise.resolve(this.setState({...this.state, date: evt.target.value})).then(
            () => this.props.onChange(this.state.date + " " + this.state.time));
    }

    updateTime(evt){
        Promise.resolve(this.setState({...this.state, time: evt.target.value})).then(
            () => this.props.onChange(this.state.date + " " + this.state.time));
    }

    render(){
        return [<Col>
                <Form.Group>
                    <Form.Label>Select a date</Form.Label>
                    <Form.Control type="date"
                        value={this.state.date}
                        onChange={this.updateDate.bind(this)}/>
                </Form.Group>
            </Col>,
            <Col>
                <Form.Group>
                    <Form.Label>Select a time</Form.Label>
                    <Form.Control type="time"
                        value={this.state.time}
                        onChange={this.updateTime.bind(this)}/>
                </Form.Group>
            </Col>]
    }
}

export default FormDatetime;