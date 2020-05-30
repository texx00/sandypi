var socket = io.connect(location.host);

function drawnow(code){
    console.log("Sending start command");
    socket.emit('message', {data: 'start:'+code});
}

function queue(code){
    console.log("Sending queue command");
    socket.emit('message', {data: 'queue:'+code});
}

function delete_drawing(){
    console.log("Delete file");
    $("#popup").css("display", "inline-block");
}