// Sockets Api Callbacks

import openSocket from 'socket.io-client';
import { domain } from '../utils/utils';

const socket = openSocket(domain);     // uses flask's address and port 

let _last_checked = true;
const _check_interval = 1000;
let _connection_cb;
let id;


// checks periodically if the connection is still available
function _check_connection(){
    if (_last_checked !== socket.connected){
        _last_checked = socket.connected;
        _connection_cb(_last_checked);
    }
}

// set the callback and starts the check
function connection_status_callback(cb){
    if (id === undefined)   // starts the interval again only if not already running
        _connection_cb = cb;
        id=setInterval(_check_connection, _check_interval);
}

/* ----- Sockets callbacks ----- */

// ---- Drawings ----
function drawings_refresh_response(cb){
    socket.on("drawings_refresh_response", (val) => cb(val));
}

// ---- Playlists ----
function playlists_refresh_response(cb){
    socket.on("playlists_refresh_response", (val) => cb(val));
}

function playlists_refresh_single_response(cb){
    socket.on("playlists_refresh_single_response", (val) => cb(val));
}

function playlist_create_id(cb){
    socket.on("playlist_create_id", (id) => cb(id));
}

// ---- Queue ----

function queue_status(cb){
    socket.on("queue_status", (val) => {cb(val)});
}

// ---- Manual control ----

// pass to the callback a command sent to the device from the backend
function device_command_line_return(cb){
    socket.on("command_line_show", (val) => {cb(val)});
}

// pass to the callback the device position
function device_new_position(cb){
    socket.on("preview_new_position", (val) => {cb(val)});
}

// pass to the callback the leds values
function device_leds(cb){
    socket.on("preview_leds", (val) => {cb(val)});
}

// ---- Settings ----

// receive actual settings from server after sending a request.
// use the callback to process the data received
function settings_now(cb){
    socket.on("settings_now", (val) => {cb(val)});
    socket.emit("settings_request");
}

// shows a toast message from the server side
function show_toast(cb){
    socket.on("toast_show_message", (message) => {cb(message)});
}


export {
    socket, 
    connection_status_callback, 
    drawings_refresh_response, 
    playlists_refresh_response, 
    playlists_refresh_single_response,
    playlist_create_id,
    queue_status, 
    device_command_line_return, 
    device_new_position, 
    device_leds, 
    settings_now, 
    show_toast};