var socket = io.connect(location.host);

// socket setup
$( document ).ready(function() {
    socket.on('message_container', function(message){
        console.log("M> "+message)
        $("#message_container_text").html(message);
        $("#message_container").css("visibility", "visible");
        $("#message_container").css("opacity", "1");
        setTimeout(close_message, 3000)
    });

    socket.on('current_drawing_preview', function(content){
        console.log("Updating actual code preview")
        $("#nav_bot_status").html(content)
    })

    socket.emit("request_nav_drawing_status")
});

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
