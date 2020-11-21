import "./ManualControl.scss";

import React, { Component } from 'react';

import { device_new_position } from '../../../sockets/SAC';

class Preview extends Component{
    constructor(props){
        super(props);
        this.canvas_ref = React.createRef();
        this.image_ref = React.createRef();
        this.last_x = 0;
        this.last_y = 0;
        this.primary_color = "#35ea97";
        this.dark_color = "#333333";
        this.multiplier = 5;    // multiply the pixels to get a better resolution with small tables
        this.is_mounted = false;
        this.force_image_render = false;
    }

    componentDidMount(){
        if (!this.is_mounted){
            this.is_mounted = true;
            this.canvas = this.canvas_ref.current;
            this.ctx = this.canvas.getContext("2d");
            this.clearCanvas();
            this.forceUpdate();
            device_new_position(this.newLineFromDevice.bind(this));
        }
    }
    
    componentDidUpdate(){
        if (this.force_image_render){
            this.force_image_render = false;
            this.updateImage();
        }
    }

    shouldComponentUpdate(nextProps){
        if (nextProps.width !== this.props.width || nextProps.height !== this.props.width){
            this.force_image_render = true;
        }
        return true;
    }
    
    updateImage(){
        if (this.canvas !== undefined)
            this.image_ref.current.src = this.canvas.toDataURL();
    }
    
    limitValue(value, min, max){
        return Math.min(max, Math.max(min, parseFloat(value)));
        // TODO fix this: this solution is not really working. It is deforming the drawing. Should calculate the interesction point with the table border, keep in memory the older point to interpolate again next time, etc...
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
        this.ctx.lineTo(x * this.multiplier, this.props.height * this.multiplier - y * this.multiplier);
        this.ctx.stroke();
        this.ctx.lineWidth = this.multiplier;
        this.last_x = x;
        this.last_y = y;
        this.updateImage();
    }

    clearCanvas(){
        this.ctx.fillStyle = this.primary_color;
        this.ctx.fillRect(0,0, this.props.width * this.multiplier, this.props.height * this.multiplier);
        this.ctx.fillStyle = this.dark_color;
        this.last_x = 0;
        this.last_y = 0;
        this.ctx.beginPath();
        this.ctx.moveTo(this.last_x, this.props.height * this.multiplier - this.last_y);
        this.updateImage();
        // TODO add some sort of animation/fading
    }

    newLineFromDevice(line){
        if(line.includes("G28")){
            this.clearCanvas();
        }
        if(line.includes("G0") || line.includes("G1") || line.includes("G00") || line.includes("G01")){
            this.drawLine(line);
        }
    }

    render(){
        return <div>
            <canvas ref={this.canvas_ref} className="d-none" width={this.props.width * this.multiplier} height={this.props.height * this.multiplier}/>
            <img ref={this.image_ref} 
                key={this.props.imageKey}
                className="preview-style"
                alt="Error during preview loading"/>
        </div>
    }
}

export default Preview;