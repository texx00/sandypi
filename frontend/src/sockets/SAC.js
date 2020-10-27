// Sockets Api Callbacks

import openSocket from 'socket.io-client';

const socket = openSocket("http://localhost:5000");     // uses flask's port

// Multiple callbacks handling functions/variables
let _callbacks = {
    dclr: [],
    dnp: [],
    sn: [],
    st: []
};

// this functions is used as a tool to save multiple callbacks for the tools
function _add_callback(id, cb){
    if (!_callbacks[id].includes(cb))
        _callbacks[id].push(cb);
}

// this function calls all the callbacks with the same id
function _use_callback(id, val){
    _callbacks[id].forEach((cb)=>{cb(val)});
}

/* ----- Sockets callbacks ----- */

// pass to the callback a command sent to the device from the backend
function device_command_line_return(cb){
    _add_callback("dclr", cb);
    socket.on("command_line_show", (val) => {_use_callback("dclr", val)});
}

// pass to the callback the device position
function device_new_position(cb){
    _add_callback("dnp", cb);
    socket.on("preview_new_position", (val) => {_use_callback("dnp", val)});
}

// receive actual settings from server after sending a request.
// use the callback to process the data received
function settings_now(cb){
    _add_callback("sn", cb);
    socket.on("settings_now", (val) => {_use_callback("sn", val)});
    socket.emit("settings_request");
}

// shows a toast message from the server side
function show_toast(cb){
    _add_callback("st", cb);
    socket.on("toast_show_message", (message) => {_use_callback("st", message)});
}


export {socket, device_command_line_return, device_new_position, settings_now, show_toast};