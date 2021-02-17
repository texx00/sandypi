import React, { Component } from 'react';
import { ContextMenu, ContextMenuTrigger, MenuItem } from 'react-contextmenu';
import nextId from 'react-id-generator';

class DrawingCardMenu extends Component{
    id = nextId()

    render(){
        // TODO generate the same settings that are available inside the drawing page here (like add to playlist, delete, etc)
        return <div>
            <ContextMenuTrigger id={"menu_" + this.id}>
                {this.props.children}
            </ContextMenuTrigger>
            <ContextMenu id={"menu_" + this.id}>
                <MenuItem onClick={() => this.props.onStartDrawing(this.props.drawing.id)}>
                    Start/queue drawing
                </MenuItem>
            </ContextMenu>
        </div>
    }
}

export default DrawingCardMenu;