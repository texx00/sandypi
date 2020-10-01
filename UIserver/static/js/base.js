var socket = io(location.host);

let primary_color;
let dark_color;

function document_ready(){};

$( document ).ready(function() {
    // socket callbacks setup
    socket.on('message_toast', function(message){
        show_toast(message);
    });

    let style = window.getComputedStyle($(".text-primary")[0]);
    primary_color = style.getPropertyValue('color');
    style = window.getComputedStyle($(".bg-dark")[0]);
    dark_color = style.getPropertyValue('background-color');

    socket.on('current_drawing_preview', function(content){
        console.log("Updating actual code preview");
        if(content==""){
            $("#nav_bot_status").css("visibility", "hidden");
            $("#nav_bot_status").css("opacity", "0");
            $("#nav_bot_status").off("click");
        }else{
            $("#nav_bot_status").html(content);
            $("#nav_bot_status").css("visibility", "visible");
            $("#nav_bot_status").css("opacity", "1");
            $("#nav_bot_status").on("click", function (){
                show_queue();
            });
        }
    });

    socket.emit("request_nav_drawing_status");
    document_ready()    // used by the other script to access the document ready callback without overwriting
});

// shows a toast message to the user
function show_toast(message){
    console.log("M> "+message);
    let toast = '\
        <div class="toast m-3" data-autohide="true", data-delay="3000"  role="status" aria-live="polite" aria-atomic="true">\
            <div class="toast-body">\
                <div class="row">\
                    <div class="col pr-0 align-self-center">\
                        <span>'+message+'</span>\
                    </div>\
                <div class="col-sm-auto align-self-center">\
                    <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">\
                        <span aria-hidden="true">&times;</span>\
                    </button>\
                </div>\
            </div>\
        </div>';
    let element = $(toast);
    $("#toasts_container").append(element);
    element.toast("show");    
}

// --- Navbar functions ---
function home(){
    window.location=location.protocol + '//' + location.host;
}

function show_queue(){
    window.location=location.protocol + '//' + location.host + "/queue";
}