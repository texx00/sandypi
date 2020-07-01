var must_save = false;
var sortable;

var show_delete = true;

function document_ready() {
    $('#playlist_name').on('keyup', function() {updateTitle();});
    // setting up the drawings to be sortable
    Sortable.create($('#drawings_ul').get(0), 
        {   animation:150,                              // animation when something is dragged
            ghostClass: "sortable_ghost",               // ghost object style class
            chosenClass: "sortable_chosen",             // dragged object style class
            filter: ".remove_drawing",                  // filter the mouse event: on the elements with this class it will not activate the sortable class but will launch onclick events
            onStart: function (evt){                    // when starts to drag it removes the "delete element" button and disable it until the object is released
                element = $("div.remove_drawing")
                element.css("opacity", "0");
                element.css("visibility", "hidden");
                show_delete = false;
            },
            onEnd: function (evt){                      // when the element is released reactivate the "delete element" activation
                show_delete = true;
            },
            onUpdate: function (evt) {                  // when the list is resorted set the flag to save before exit
            must_save = true;
        },});
    
    // hover callbacks for grid elements to show the "delete drawing" button
    $("li.playlist_drawing_container").hover(function(){
            if(show_delete){
                var element = $(this).children("div.remove_drawing");
                element.css("opacity", "1");
                element.css("visibility", "visible");
            }
        }, function(){
            var element = $(this).children("div.remove_drawing");
            element.css("opacity", "0");
            element.css("visibility", "hidden");
    });
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
            save_data['drawings'].push($(this).children('div.data').html());
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

function delete_drawing(code){
    $("#sortable_li_"+code).remove();
    must_save = true;
}

function start_playlist(code){
    socket.emit("start_playlist", code);
}