var must_save = false;
var sortable;

var show_delete = true;

function document_ready() {
    $('#playlist_name').on('keyup', function() {updateTitle();});
    // setting up the drawings to be sortable
};

// Ask to save before leaving the page
$(window).bind('beforeunload', function(){
    if( must_save ){
        console.log("Save before exiting?");
        return "Are you sure you want to leave without saving?"
    }
});

function updateTitle(){
    must_save = true
    text = $("#playlist_name").html().replace(/(?:&nbsp;|<br>)/g,'');
    $(document).prop('title', text);
}

function save(){
    must_save=false
    save_data = {
        name : $("#playlist_name").html().replace(/(?:&nbsp;|<br>)/g,''),
        id : $("#playlist_id").html(),
        elements: []
    }
    $("#drawings_ul").children('li').each(function( index ) {
            save_data['elements'].push($(this).find('div.data').html());
        });
    socket.emit('playlist_save', {data: save_data});
    show_toast("Playlist saved");
}

function delete_playlist(code){
    console.log("Delete file");
    $("#modal_container").html('\
        <div class="center p-5">\
            Are you sure you want to delete this playlist?\
        </div>\
        <div class="modal-footer">\
            <div class="text-center w-100 m-0">\
                <button type="button" class="btn btn-primary m-0" data-dismiss="modal">No</button>\
                <button type="button" class="btn btn-primary m-0" onclick=confirm_delete('+code+')>Yes</button>\
            </div>\
        </div>\
    ');
    $('.modal').modal('show');
}

function confirm_delete(code){
    window.location=location.protocol + '//' + location.host + "/delete/playlist/" + code
}

function start_playlist(code){
    socket.emit("start_playlist", code);
}