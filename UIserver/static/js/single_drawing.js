function drawnow(code){
    console.log("Sending start command");
    socket.emit('message', {data: 'start:'+code});
}

function queue(code){
    console.log("Sending queue command");
    socket.emit('message', {data: 'queue:'+code});
}

function undo(){
    close_popup_noevent();
}

function delete_drawing(){
    console.log("Delete file");
    $("#popup").css("display", "inline-block");
}

function confirm_delete(code){
    window.location=location.protocol + '//' + location.host + "/delete/" + code
}