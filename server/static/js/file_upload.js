var dropzone;

function show_dropzone(playlist=0){
    if(!dropzone){
        $("#modal_container").html('\
            <div id="upload_dropzone" class="clickable">\
                <div class="animated-background m-2 p-5 mh-100 d-flex justify-content-center align-items-center no-clickable" data-dz-message>\
                    <div class="d-block">\
                        <span class="text-center">Drag and drop the .gcode/.nc file here <br>or click to open the file explorer</span>\
                        <div class="progress mt-2">\
                            <div id="upload-progress-bar" class="progress-bar progress-bar-animated bg-primary" role="progressbar" aria-valuenow="25%" aria-valuemin="0" aria-valuemax="100"></div>\
                        </div>\
                    </div>\
                </div>\
            </div>\
            <div class="modal-footer">\
                <div class="text-center w-100 m-0">\
                    <button type="button" class="btn btn-primary m-0" data-dismiss="modal">Close</button>\
                </div>\
            </div>');
        dropzone = new Dropzone("#upload_dropzone", {url: location.protocol + '//' + location.host + "/upload/" + playlist, acceptedFiles: ".gcode, .nc"});
        dropzone.on("success", file_loaded_success);
        dropzone.on("error", file_loaded_error);
        dropzone.on("totaluploadprogress", function (progress) {
            console.log("progress " + progress)
            $("#upload-progress-bar").css("width", progress+"%");
            $("#upload-progress-bar").attr("aria-valuenow", progress+"%");
          });
        dropzone.on("addedfile", function(file){
            console.log("start")
            // TODO fix progress bar (not showing progress correctly)
            //$("#upload-progress-bar").parent().css("display", "block");
        })
    }
    $("#upload-progress-bar").parent().css("display", "none");
    $('.modal').modal('show');
}

function file_loaded_success(){
    location.reload();
}

function file_loaded_error(){
    show_toast("Error during file loading")
}

function redirect_drawing(code){
    window.location.href = "/drawing/"+code;
}

function redirect_playlist(code){
    window.location.href = "/playlist/"+code;
}

function create_new_playlist(){
    window.location.href ="/create/playlist"
}