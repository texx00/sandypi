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

function create_element_timing(){
    return {
        element_type: "timing",
        delay: "",
        expiry_date: "",
        alarm_time: ""
    }
}

export { create_element_drawing, create_element_gcode, create_element_timing };