function home(){
    window.location=location.protocol + '//' + location.host
}

function close_popup(event){
    if (event.target != event.currentTarget)
        return;
    close_popup_noevent();
}

function close_popup_noevent(){
    $("#popup").css("display", "none");
}

function dummy(){}
