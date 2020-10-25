// Sockets Api Callbacks

import openSocket from 'socket.io-client';

const socket = openSocket("http://localhost:5000");     // uses flask's port


// receive actual settings from server after sending a request.
// use the callback to process the data received
function settings_now(cb){
    socket.on("settings_now", settings => {cb(settings)});
    socket.emit("settings_request");
}

// shows a toast message from the server side
function show_toast(cb){
    socket.on("toast_show_message", message => {cb(message)});
}


export {socket, settings_now, show_toast};