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
    window.location=location.protocol + '//' + location.host + "/delete/drawing/" + code
}

//TODO I don't like the styling limitation of the select option. May change to a different thing in the future
function add_to_playlist(drawing_code){
    $("#dialog_text").html("Select the playlist<br>"+$("#playlists_select").html());
    $("#dialog_confirm").off("click");
    $("#dialog_confirm").click(function(){
        pl_code = $("#playlists_dropdown").val();
        console.log("Pl_code: "+pl_code)
        socket.emit("add_to_playlist", drawing_code=drawing_code, playlist_code=pl_code);
        console.log("Added to playlist "+pl_code);
        close_popup_noevent();
    });
    $("#popup").css("display", "inline-block");
}