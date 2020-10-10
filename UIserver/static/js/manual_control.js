/* on_document_ callback */
function document_ready(){
    prepare_command_window();
    prepare_canvas();
}


/***** INPUT AREA *****/

var command_history = new Array();
var command_history_counter = 0;

function prepare_command_window(){
     // add keyup listener to the gcode input
    $("#gcode_command").keyup(function(event) {
        if (event.keyCode === 13) {             // Enter
            send_command();
        } else if (event.keyCode === 38) {      // Arrow up 
            if(command_history_counter > 0){
                command_history_counter--;
            }
            $("#gcode_command").val(command_history[command_history_counter]);
        } else if (event.keyCode === 40) {      // Arrow down
            if(command_history_counter < command_history.length){
                command_history_counter++;
            }
            $("#gcode_command").val(command_history[command_history_counter]);
        }
      });

    socket.on("command_line_show", function(data){
        add_command_line(data);
    });
}

function add_command_line(data){
    div = $("#message_from_device")
    content = div.html()
    content = content + "<br>" + data
    div.html(content)
    div.scrollTop(div[0].scrollHeight);
}

function send_command(val = null){
    if (val==null){
        val = $("#gcode_command").val();
        $("#gcode_command").val("");
        command_history.push(val);
        command_history_counter++;
    }
    add_command_line("> "+val);
    socket.emit("send_gcode_command", val);
}


/***** Path canvas *****/

let canvas;
let ctx;
let last_x;
let last_y;

function limit_value(value, min, max){
    return Math.min(max, Math.max(min, parseFloat(value)));
}

function draw_line(line){
    let l = line.split(" ");
    let x = last_x;
    let y = last_y;
    for(const i in l){
        if(l[i].includes("X")){
            x = l[i].replace(/[^\d.-]/g, '');
        }
        if(l[i].includes("Y")){
            y = l[i].replace(/[^\d.-]/g, '');
        }
    }
    x = limit_value(x, 0, canvas.width);
    y = limit_value(y, 0, canvas.height);
    ctx.lineTo(x, canvas.height-y);
    ctx.stroke();
    last_x = x;
    last_y = y;
}

function clear_canvas(){
    ctx.fillStyle = primary_color;
    ctx.fillRect(0,0, canvas.width, canvas.height);
    ctx.fillStyle = primary_color;
    last_x = 0;
    last_y = 0;
    ctx.beginPath();
    ctx.moveTo(last_x, canvas.height-last_y);
}

function prepare_canvas(){
    canvas = document.getElementById("path_canvas");
    canvas.width = $("#device_width").html();
    canvas.height = $("#device_height").html();
    ctx = canvas.getContext("2d");

    clear_canvas();

    socket.on("preview_new_position", function(line){
        console.log("Received line: " + line);
        add_command_line(line);
        if(line.includes("G28")){
            clear_canvas();
            // TODO add some sort of animation/fading
        }
        if(line.includes("G0") || line.includes("G1") || line.includes("G00") || line.includes("G01")){
            draw_line(line);
        }
    });
}

// TODO fix first point and design