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

function settings_shutdown_system(){
    socket.emit("settings_shutdown_system");
}

function settings_reboot_system(){
    socket.emit("settings_reboot_system");
}


// ---- DRAWINGS ----

// emit a socket to delete a drawing
function drawing_delete(code){
    socket.emit("drawing_delete", code);
}

// emit a socket to request an updated list of drawings
function drawings_request(){
    socket.emit("drawings_refresh")
}

// emit a socket to add a drawing to the queue
function drawing_queue(code){
    socket.emit("drawing_queue", code);
}


// ---- LEDS ----

function leds_set_color(color){
    socket.emit("leds_set_color", JSON.stringify(color));
}


// ---- PLAYLISTS ----
// emit a socket to request an updated list of playlists
function playlists_request(){
    socket.emit("playlists_refresh");
}

// delete a playlist
function playlist_delete(id){
    socket.emit("playlist_delete", id);
}

// add selected playlist to the queue
function playlist_queue(id){
    socket.emit("playlist_queue", id);
}

//emit a socket to create a new playlist
function playlist_save(pl){
    socket.emit("playlist_save", JSON.stringify(pl));
}


// ---- QUEUE ----

// ask for an updated queue
function queue_get_status(){
    socket.emit("queue_get_status");
}

// set a new order for the queue
function queue_set_order(list){
    socket.emit("queue_set_order", JSON.stringify(list));
}

function queue_stop_drawing(){
    socket.emit("queue_stop_drawing");
}


export {
    send_command,  
    drawing_delete, 
    drawings_request, 
    drawing_queue, 
    leds_set_color,
    playlists_request, 
    playlist_delete,
    playlist_queue,
    playlist_save, 
    queue_get_status,
    queue_set_order,
    queue_stop_drawing,
    settings_save,
    settings_shutdown_system,
    settings_reboot_system
};