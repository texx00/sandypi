/*
 * This file creates playlist elements. Those elements must have the same arguments of the classes that can be found in playlist_element.py
 */


 // Standard drawing element
function createElementDrawing(drawing){
    return {
        element_type: "drawing", 
        drawing_id: drawing.id !== undefined ? drawing.id : 0
    }
}

// Element that run some gcode commands
function createElementGcode(){
    return {
        element_type: "command",
        command: ""
    }
}

// Element that adds a delay between other elements
function createElementTiming(){
    return {
        element_type: "timing",
        type: "delay",
        delay: "",
        expiry_date: "",
        alarm_time: ""
    }
}

// Element to start a random drawing
function createElementShuffle(playlistId){
    return {
        element_type: "shuffle",
        shuffle_type: "0",
        playlist_id: playlistId
    }
}

// Element to start another playlist
function createElementPlaylistStart(playlistId){
    return {
        element_type: "start_playlist",
        playlist_id: playlistId
    }
}

export { createElementDrawing, createElementGcode, createElementTiming, createElementShuffle, createElementPlaylistStart };