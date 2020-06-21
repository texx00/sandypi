var dropzone;

function show_dropzone(playlist=0){
    if(!dropzone){
        $("#popup_container").html('\
    <div id="upload_dropzone">\
        <div class="dz-message" data-dz-message>\
            <span class="message_span">Drag and drop the .gcode/.nc file here <br>or click to open the file explorer</span>\
            <div id="upload_progress">\
                <div id="upload_progress_value">0%</div>\
                <span id="upload_progress_bar"></span>\
            </div>\
        </div>\
    </div>\
    <button id="undo_upload" on_click="hide_dropzone()">Undo</button>');
        dropzone = new Dropzone("#upload_dropzone", {url: location.protocol + '//' + location.host + "/upload/" + playlist, acceptedFiles: ".gcode, .nc"});
        dropzone.on("success", file_loaded_success);
        dropzone.on("error", file_loaded_error);
        dropzone.on("totaluploadprogress", function (progress) {
            $("#upload_progress_bar").css("width", progress + '%');
            $("#upload_progress_value").html(progress + '%');
          });
        dropzone.on("addedfile", function(file){
            $("#upload_progress").css("display", "block");
        })
    }

    $("#popup").css("display", 'block');
    $("#popup").click(function (){
        hide_dropzone();
    });
}

function hide_dropzone(){
    $("#popup").css("display", "none");
    dropzone.removeAllFiles(true);
    $("#upload_progress").css("display", "none");
    location.reload()
}

function file_loaded_success(){
    console.log("Success");
    hide_dropzone();
}

function file_loaded_error(){
    console.log("Error");
    hide_dropzone();
}

function redirect_drawing(code){
    window.location.href = "/drawing/"+code;
}

function redirect_playlist(code){
    window.location.href = "/playlist/"+code;
}

function create_new_playlist(){
    window.location.href ="/create_playlist"
}