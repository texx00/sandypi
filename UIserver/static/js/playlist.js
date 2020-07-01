var must_save = false;
var sortable;
function document_ready() {
    $('#playlist_name').on('keyup', function() {updateTitle();});
    // setting up the drawings to be sortable
    Sortable.create($('#drawings_ul').get(0), 
        {animation:150, 
            onUpdate: function (evt) {
            must_save = true;
        },});
};

// Ask to save before leaving the page
$(window).bind('beforeunload', function(){
    if( must_save ){
        console.log("Save before exiting?");
        return "Are you sure you want to leave without saving?"
    }
});

function updateTitle(){
    console.log("Prova")
    must_save = true
    text = $("#playlist_name").html().replace(/(?:&nbsp;|<br>)/g,'');
    $(document).prop('title', text);
}

function save(){
    must_save=false
    save_data = {
        name : $("#playlist_name").html().replace(/(?:&nbsp;|<br>)/g,''),
        id : $("#playlist_id").html(),
        drawings: []
    }
    $("#drawings_ul").children('li').each(function( index ) {
        save_data['drawings'].push($(this).children('div').html());
      });
    socket.emit('playlist_save', {data: save_data});
}

function delete_playlist(code){
    console.log("Delete file");
    $("#dialog_text").html("Are you sure you want to delete this playlist?");
    $("#dialog_confirm").off("click");
    $("#dialog_confirm").click(function(){confirm_delete(code)});
    $("#popup").css("display", "inline-block");
}

function confirm_delete(code){
    window.location=location.protocol + '//' + location.host + "/delete/playlist/" + code
}