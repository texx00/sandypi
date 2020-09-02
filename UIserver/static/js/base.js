var socket = io(location.host);

function document_ready(){};

// socket setup
$( document ).ready(function() {
    socket.on('message_container', function(message){
        show_message(message)
    });

    socket.on('current_drawing_preview', function(content){
        console.log("Updating actual code preview")
        if(content==""){
            $("#nav_bot_status").css("visibility", "hidden");
            $("#nav_bot_status").css("opacity", "0");
            $("#nav_bot_status").off("click");
        }else{
            $("#nav_bot_status").html(content);
            $("#nav_bot_status").css("visibility", "visible");
            $("#nav_bot_status").css("opacity", "1");
            $("#nav_bot_status").click(function (){
                show_queue();
            });
        }
    })

    socket.emit("request_nav_drawing_status")
    document_ready()    // used by the other script to access the document ready callback without overwriting
});

// TODO show a list of messages instead of only the most recent one. The older of the list must expire after some seconds
function show_message(message){
    console.log("M> "+message);
    let toast = '<div class="toast" data-autohide="true", data-delay="3000"  role="status" aria-live="polite" aria-atomic="true"><div class="toast-body"><div class="row"><div class="col pr-0 align-self-center"><span>'+message+'</span></div><div class="col-sm-auto align-self-center"><button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close"><span aria-hidden="true">&times;</span></button></div></div></div>';
    let element = $(toast);
    $("#toasts_container").append(element);
    element.toast("show")    
}

// --- Navbar functions ---
function home(){
    window.location=location.protocol + '//' + location.host
}

function show_queue(){
    window.location=location.protocol + '//' + location.host + "/queue"
}

// --- Message functions ---
function close_message(){
    $("#message_container").css("visibility", "hidden");
    $("#message_container").css("opacity", "0");
}

// --- Popup functions ---
function close_popup(event){
    
    if (event.target != event.currentTarget)
        return;
    close_popup_noevent();
}

function close_popup_noevent(){
    $("#popup").css("display", "none");
}

function dummy(){}
