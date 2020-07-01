var command_history = new Array();
var command_history_counter = 0;

function add_command_line(data){
    div = $("#message_from_device")
    content = div.html()
    content = content + "<br>" + data
    div.html(content)
    div.scrollTop(div[0].scrollHeight);
}

function document_ready(){
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

    socket.on("frontend_message_from_device", function(data){
        add_command_line(data);
    });
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
