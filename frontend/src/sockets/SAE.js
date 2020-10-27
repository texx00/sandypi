import {socket} from './SAC';

// sends a gcode command to the feeder
function send_command(command){
    socket.emit("send_gcode_command", command);
}

// emit a socket with the updated settigns
function settings_save(settings, connect=false){
    socket.emit("settings_save", settings, connect);
}

export {send_command, settings_save};