import {socket} from './SAC';

// emit a socket with the updated settigns
function settings_save(settings, connect=false){
    socket.emit("settings_save", settings, connect);
}

export {settings_save};