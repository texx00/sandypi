function document_ready(){
    socket.on("serial_list_show", function(data){
        console.log("list_request");
        console.log(data);
        var options = [];
        data.push("FAKE")
        var selector = $("#serial_ports")
        selector.html(" ")
        var selected_value = $("#saved_port").html()
        for (var i = 0; i < data.length; i++){
            selector.append($("<option></option>").attr("value", data[i]).text(data[i]));
        }
        selector.val(selected_value);
    });
};

function save(connect = false){
    data = {
        serial : {
            port : $("#serial_ports").val(),
            baud : $("#serial_baud").val()
        },
        scripts : {
            connection: $("#script_connection").val()
        }
    }
    socket.emit("save_settings", data, connect);
};

