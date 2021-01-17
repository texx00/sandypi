import "./ManualControl.scss";

import React, { Component } from 'react';

import { device_new_position } from '../../../sockets/SAC';

const ANIMATION_FRAMES_MAX = 10;
const ANIMATION_DURATION = 1000;

class Preview extends Component{
    constructor(props){
        super(props);
        this.canvas_ref = React.createRef();
        this.image_ref = React.createRef();
        this.primary_color = "#eeeeee";
        this.dark_color = "#333333";
        this.multiplier = 5;    // multiply the pixels to get a better resolution with small tables
        this.is_mounted = false;
        this.force_image_render = false;
        this.animation_frames = 0;

        // previous commanded point
        this.pp = {
            x: 0,
            y: 0
        }
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
        // this is not the optimal solution for limiting the value. Will not keep the integrity of the drawing.
        // this limitation is necessary only when the drawing is bigger than the device sizes. 
        // If the sizes are set correctly in the settings, the feeder can adjust the external points to fit the device size this it is not necessary to limit the value
        return Math.min(max, Math.max(min, parseFloat(value)));
    }

    drawLine(line){
        let l = line.split(" ");
        let x = this.pp.x;
        let y = this.pp.y;
        for(const i in l){
            if(l[i].includes("X")){
                x = l[i].replace(/[^\d.-]/g, '');
            }
            if(l[i].includes("Y")){
                y = l[i].replace(/[^\d.-]/g, '');
            }
        }
        x = this.limitValue(x, 0, this.props.width);
        y = this.limitValue(y, 0, this.props.height);
        this.ctx.lineTo(x * this.multiplier, this.props.height * this.multiplier - y * this.multiplier);
        this.ctx.stroke();
        this.ctx.lineWidth = this.multiplier;
        this.pp.x = x;
        this.pp.y = y;
        this.updateImage();
    }

    clearCanvas(){
        this.pp.x = 0;
        this.pp.y = 0;
        this.ctx.beginPath();
        this.ctx.moveTo(this.pp.x, this.props.height * this.multiplier - this.pp.x);
        this.animation_frames = 0;
        this.animateClear();
    }

    animateClear(){
        this.ctx.globalAlpha = 0.7;
        this.ctx.fillStyle = this.primary_color;
        this.ctx.fillRect(0,0, this.props.width * this.multiplier, this.props.height * this.multiplier);
        this.ctx.fillStyle = this.dark_color;
        this.ctx.globalAlpha = 1;
        this.updateImage();
        if (this.animation_frames++ < ANIMATION_FRAMES_MAX){
            setTimeout(this.animateClear.bind(this), ANIMATION_DURATION/ANIMATION_FRAMES_MAX);
        }
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
                alt="Preview"/>
        </div>
    }
}

export default Preview;