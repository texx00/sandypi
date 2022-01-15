import {socket} from './sCallbacks';

// sends a gcode command to the feeder
function sendCommand(command){
    socket.emit("send_gcode_command", command);
}


// ---- SETTINGS ----- 
// emit a socket with the updated settigns
function settingsSave(settings, connect=false){
    socket.emit("settings_save", settings, connect);
}

function settingsShutdownSystem(){
    socket.emit("settings_shutdown_system");
}

function settingsRebootSystem(){
    socket.emit("settings_reboot_system");
}


// ---- DRAWINGS ----

// emit a socket to delete a drawing
function drawingDelete(code){
    socket.emit("drawing_delete", code);
}

// emit a socket to request an updated list of drawings
function drawingsRequest(){
    socket.emit("drawings_refresh")
}

// emit a socket to add a drawing to the queue
function drawingQueue(code){
    socket.emit("drawing_queue", code);
}

function drawingPause(){
    socket.emit("drawing_pause");
}

function drawingResume(){
    socket.emit("drawing_resume");
}


// ---- LEDS ----
function ledsSetColor(color){
    socket.emit("leds_set_color", color);
}

function ledsAutoDim(val){
    socket.emit("leds_auto_dim", val);
}

// ---- PLAYLISTS ----
// emit a socket to request an updated list of playlists
function playlistsRequest(){
    socket.emit("playlists_refresh");
}

// delete a playlist
function playlistDelete(id){
    socket.emit("playlist_delete", id);
}

// add selected playlist to the queue
function playlistQueue(id){
    socket.emit("playlist_queue", id);
}

//emit a socket to create a new playlist
function playlistSave(pl){
    socket.emit("playlist_save", JSON.stringify(pl));
}

function playlistCreateNew(){
    window.showToast("Creating new playlist...");
    socket.emit("playlist_create_new");
}


// ---- QUEUE ----

// ask for an updated queue
function queueGetStatus(){
    socket.emit("queue_get_status");
}

// set a new order for the queue
function queueSetOrder(list){
    socket.emit("queue_set_order", JSON.stringify(list));
}

// stops only the current drawing and go on with the next one
function queueNextDrawing(){
    socket.emit("queue_next_drawing");
    window.showToast(<div>The current drawing is being stopped. <br/>The device will still run until the buffer is empty.</div>)
}

// clears the queue and stop the device
function queueStopAll(){
    socket.emit("queue_stop_all");
    window.showToast(<div>Stopping the device...</div>);
}

// updates the value of the "repeat" flag
function queueSetRepeat(val){
    socket.emit("queue_set_repeat", val);
}

// updates the value of the "shuffle" flag
function queueSetShuffle(val){
    socket.emit("queue_set_shuffle", val);
}

// updates the value of the queue interval
function queueSetInterval(val){
    socket.emit("queue_set_interval", val);
}

// starts a random drawing
function queueStartRandom(){
    socket.emit("queue_start_random");
}

// ---- MANUAL CONTROL ----

function controlEmergencyStop(){
    socket.emit("control_emergency_stop");
}

// ---- UPDATES ----

function toggleAutoUpdateEnabled(){
    socket.emit("updates_toggle_auto_enabled");
}


export {
    sendCommand,  
    controlEmergencyStop,
    drawingDelete, 
    drawingsRequest, 
    drawingQueue, 
    drawingPause,
    drawingResume,
    ledsSetColor,
    ledsAutoDim,
    playlistsRequest, 
    playlistDelete,
    playlistQueue,
    playlistSave, 
    playlistCreateNew,
    queueGetStatus,
    queueSetOrder,
    queueNextDrawing,
    queueStopAll,
    queueSetRepeat,
    queueSetShuffle,
    queueSetInterval,
    queueStartRandom,
    settingsSave,
    settingsShutdownSystem,
    settingsRebootSystem,
    toggleAutoUpdateEnabled
};