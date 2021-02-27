/*
 * This file creates playlist elements. Those elements must have the same arguments of the classes that can be found in playlist_element.py
 */


 // Standard drawing element
function create_element_drawing(drawing){
    return {
        element_type: "drawing", 
        drawing_id: drawing.id
    }
}

// Element that run some gcode commands
function create_element_gcode(){
    return {
        element_type: "command",
        command: ""
    }
}

// Element that adds a delay between other elements
function create_element_timing(){
    return {
        element_type: "timing",
        type: "delay",
        delay: "",
        expiry_date: "",
        alarm_time: ""
    }
}

// Element to start a random drawing
function create_element_shuffle(playlistId){
    return {
        element_type: "shuffle",
        shuffle_type: "0",
        playlist_id: playlistId
    }
}

// Element to start another playlist
function create_element_playlist_start(playlistId){
    return {
        element_type: "start_playlist",
        playlist_id: playlistId
    }
}

export { create_element_drawing, create_element_gcode, create_element_timing, create_element_shuffle, create_element_playlist_start };