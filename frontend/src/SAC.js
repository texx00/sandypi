// Sockets Api Callbacks

import openSocket from 'socket.io-client';

const socket = openSocket("http://localhost:5000");     // uses flask's port

function show_toast(cb){
    socket.on("toast_show_message", message => {cb(message)});
}



export {show_toast, socket};