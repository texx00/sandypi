import {socket} from './SAC';

// sends a gcode command to the feeder
function send_command(command){
    socket.emit("send_gcode_command", command);
}


// ---- SETTINGS ----- 
// emit a socket with the updated settigns
function settings_save(settings, connect=false){
    socket.emit("settings_save", settings, connect);
}

// ---- DRAWINGS ----

// emit a socket to add a drawing to the queue
function drawing_queue(code){
    socket.emit("drawing_queue", code);
}

// ---- QUEUE ----

// ask for an updated queue
function queue_get_status(){
    socket.emit("queue_get_status");
}

export {send_command, settings_save, drawing_queue, queue_get_status};