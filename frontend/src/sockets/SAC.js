// Sockets Api Callbacks

import openSocket from 'socket.io-client';
import { domain } from '../utils/utils';

const socket = openSocket(domain);     // uses flask's address and port 
//TODO on connection lost show a message

/* ----- Sockets callbacks ----- */

// ---- Drawings ----
function drawings_refresh_response(cb){
    socket.on("drawings_refresh_response", (val) => cb(val));
}

// ---- Playlists ----
function playlists_refresh_response(cb){
    socket.on("playlists_refresh_response", (val) => cb(val));
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


export {socket, drawings_refresh_response, playlists_refresh_response, queue_status, device_command_line_return, device_new_position, settings_now, show_toast};