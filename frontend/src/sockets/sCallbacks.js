// Sockets Api Callbacks

import openSocket from 'socket.io-client';
import { domain } from '../utils/utils';

const socket = openSocket(domain);     // uses flask's address and port 

let _lastChecked = true;
const _checkInterval = 1000;
let _connectionCb;
let id;


// checks periodically if the connection is still available
function _checkConnection(){
    if (_lastChecked !== socket.connected){
        _lastChecked = socket.connected;
        _connectionCb(_lastChecked);
    }
}

// set the callback and starts the check
function connectionStatusCallback(cb){
    if (id === undefined)   // starts the interval again only if not already running
        _connectionCb = cb;
        id=setInterval(_checkConnection, _checkInterval);
}

/* ----- Sockets callbacks ----- */

// ---- Drawings ----
function drawingsRefreshResponse(cb){
    socket.on("drawings_refresh_response", (val) => cb(val));
}

// ---- Playlists ----
function playlistsRefreshResponse(cb){
    socket.on("playlists_refresh_response", (val) => cb(val));
}

function playlistsRefreshSingleResponse(cb){
    socket.on("playlists_refresh_single_response", (val) => cb(val));
}

function playlistCreateId(cb){
    socket.on("playlist_create_id", (id) => cb(id));
}

// ---- Queue ----

function queueStatus(cb){
    socket.on("queue_status", (val) => {cb(val)});
}

// ---- Manual control ----

// pass to the callback a command sent to the device from the backend
function deviceCommandLineReturn(cb){
    socket.on("command_line_show", (val) => {cb(val)});
}

// pass to the callback the device position
function deviceNewPosition(cb){
    socket.on("preview_new_position", (val) => {cb(val)});
}

// pass to the callback the leds values
function deviceLeds(cb){
    socket.on("preview_leds", (val) => {cb(val)});
}

// ---- Settings ----

// receive actual settings from server after sending a request.
// use the callback to process the data received
function settingsNow(cb){
    socket.on("settings_now", (val) => {cb(val)});
    socket.emit("settings_request");
}

// shows a toast message from the server side
function showToast(cb){
    socket.on("toast_show_message", (message) => {cb(message)});
}


export {
    socket, 
    connectionStatusCallback, 
    drawingsRefreshResponse, 
    playlistsRefreshResponse, 
    playlistsRefreshSingleResponse,
    playlistCreateId,
    queueStatus, 
    deviceCommandLineReturn, 
    deviceNewPosition, 
    deviceLeds, 
    settingsNow, 
    showToast};