function document_ready(){
};

function save(connect = false){
    data = {
        serial : {
            port : $("#serial_ports").val(),
            baud : $("#serial_baud").val()
        },
        device : {
            width: $("#device_width").val(),
            height : $("#device_height").val()
        },
        scripts : {
            connection: $("#script_connection").val(),
            before: $("#script_before").val(),
            after: $("#script_after").val()
        }
    }
    socket.emit("save_settings", data, connect);
};

