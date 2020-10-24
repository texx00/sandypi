function drawnow(code, is_drawing){
    if(is_drawing == 'True'){
        $("#modal_container").html('\
            <div class="center p-5">\
                Do you really want to start this drawing now? </br>\
                Another drawing is already on the go\
            </div>\
            <div class="modal-footer">\
                <div class="text-center w-100 m-0">\
                    <button type="button" class="btn btn-primary m-0" data-dismiss="modal">No</button>\
                    <button type="button" class="btn btn-primary m-0" onclick="drawnow('+code+', \'False\')">Yes</button>\
                </div>\
            </div>\
        ');
        $('.modal').modal('show');
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
    show_toast("Drawing added to the queue")
}

function undo(){
    close_popup_noevent();
}

function delete_drawing_modal(code){
    $("#modal_container").html('\
        <div class="center p-5">\
            Are you sure you want to delete this drawing?\
        </div>\
        <div class="modal-footer">\
            <div class="text-center w-100 m-0">\
                <button type="button" class="btn btn-primary m-0" data-dismiss="modal">No</button>\
                <button type="button" class="btn btn-primary m-0" onclick="delete_drawing('+code+')">Yes</button>\
            </div>\
        </div>\
    ');
    $('.modal').modal('show');
}

function delete_drawing(code){
    window.location=location.protocol + '//' + location.host + "/delete/drawing/" + code
}

function add_to_playlist(drawing_code){
    pl_code = $("#playlists_dropdown").val();
    socket.emit("playlist_add_element", drawing_code=drawing_code, playlist_code=pl_code);
    $('.modal').modal('hide');
    show_toast("Drawing added");
}

function add_to_playlist_modal(drawing_code){
    $("#modal_container").html('\
        <div class="center p-5">\
            <div class="w-75">\
                <div class="row mb-2"><span class="w-100 text-center">Select the playlist<span></div>\
                <div class="row w-100 m-0">'+$("#playlists_select").html()+'</div>\
            </div>\
        </div>\
        <div class="modal-footer">\
            <div class="text-center w-100 m-0">\
                <button type="button" class="btn btn-primary m-0" data-dismiss="modal">Undo</button>\
                <button type="button" class="btn btn-primary m-0" onclick="add_to_playlist('+drawing_code+')">Add</button>\
            </div>\
        </div>\
    ');
    $('.modal').modal('show');
}