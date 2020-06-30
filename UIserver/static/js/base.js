var socket = io(location.host);

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
    console.log("M> "+message)
    $("#message_container_text").html(message);
    $("#message_container").css("visibility", "visible");
    $("#message_container").css("opacity", "1");
    setTimeout(close_message, 3000)
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
