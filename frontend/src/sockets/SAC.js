// Sockets Api Callbacks

import openSocket from 'socket.io-client';

const socket = openSocket("http://localhost:5000");     // uses flask's port


/* ----- Sockets callbacks ----- */

// pass to the callback a command sent to the device from the backend
function device_command_line_return(cb){
    socket.on("command_line_show", (val) => {cb(val)});
}

// pass to the callback the device position
function device_new_position(cb){
    socket.on("preview_new_position", (val) => {cb(val)});
}

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


export {socket, device_command_line_return, device_new_position, settings_now, show_toast};