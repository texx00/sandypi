function drawnow(code, is_drawing){
    if(is_drawing == 'True'){
        $("#dialog_text").html("Are you sure? </br>A drawing is already on the go");
        $("#dialog_confirm").off("click");
        $("#dialog_confirm").click(function(){drawnow(code, "False");});
        $("#popup").css("display", "inline-block");
    }else{
        console.log("Sending start command");
        socket.emit('message', {data: 'start:'+code});
        setTimeout(function(){
            window.location.reload();
        },1000);
    }
}

function queue(code){
    console.log("Sending queue command");
    socket.emit('message', {data: 'queue:'+code});
    show_message("Drawing added to the queue")
}

function undo(){
    close_popup_noevent();
}

function delete_drawing(code){
    console.log("Delete file");
    $("#dialog_text").html("Are you sure you want to delete this drawing?");
    $("#dialog_confirm").off("click");
    $("#dialog_confirm").click(function(){confirm_delete(code)});
    $("#popup").css("display", "inline-block");
}

function confirm_delete(code){
    window.location=location.protocol + '//' + location.host + "/delete/" + code
}

function substitute_buttons(is_drawing){
    
}