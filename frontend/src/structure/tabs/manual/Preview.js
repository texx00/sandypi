import "./Preview.scss";

import React, { Component } from 'react';

import { device_new_position } from '../../../sockets/SAC';

class Preview extends Component{
    constructor(props){
        super(props);
        this.canvas_ref = React.createRef();
        this.last_x = 0;
        this.last_y = 0;
        this.primary_color = "#35ea97";
        this.dark_color = "#333333";
        this.state = {height: 100};
        this.ratio = parseFloat(props.width/props.height);
    }

    componentDidMount(){
        this.canvas = this.canvas_ref.current;
        this.ctx = this.canvas.getContext("2d");
        this.clearCanvas();
        device_new_position(this.newLineFromDevice.bind(this));
        window.addEventListener('resize', this.updateDimensions.bind(this));
        this.updateDimensions();
    }

    updateDimensions(){
        this.setState({height: parseFloat(this.canvas_ref.current.width) / this.ratio});
    }
    
    limitValue(value, min, max){
        return Math.min(max, Math.max(min, parseFloat(value)));
    }

    drawLine(line){
        let l = line.split(" ");
        let x = this.last_x;
        let y = this.last_y;
        for(const i in l){
            if(l[i].includes("X")){
                x = l[i].replace(/[^\d.-]/g, '');
            }
            if(l[i].includes("Y")){
                y = l[i].replace(/[^\d.-]/g, '');
            }
        }
        x = this.limitValue(x, 0, this.canvas.width);
        y = this.limitValue(y, 0, this.canvas.height);
        this.ctx.lineTo(x, this.canvas.height-y);
        this.ctx.stroke();
        this.last_x = x;
        this.last_y = y;
        // TODO draw the canvas into an image instead of reascaling the canvas entirely
        // TODO scale the size of the canvas up to avoid aliasing in the picture
    }

    clearCanvas(){
        this.ctx.fillStyle = this.primary_color;
        this.ctx.fillRect(0,0, this.props.width, this.height);
        this.ctx.fillStyle = this.dark_color;
        this.last_x = 0;
        this.last_y = 0;
        this.ctx.beginPath();
        this.ctx.moveTo(this.last_x, this.props.height - this.last_y);
        // TODO add some sort of animation/fading
    }

    newLineFromDevice(line){
        console.log("Received line: " + line);
        if(line.includes("G28")){
            this.clearCanvas();
        }
        if(line.includes("G0") || line.includes("G1") || line.includes("G00") || line.includes("G01")){
            this.drawLine(line);
        }
    }

    render(){
        return <div>
            <canvas ref={this.canvas_ref} className="canvas-style" height={this.state.height}/>
        </div>
    }
}

export default Preview;