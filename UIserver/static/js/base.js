function home(){
    window.location=location.protocol + '//' + location.host
}

function close_popup(event){
    if (event.target != event.currentTarget)
        return;
    console.log("Close")
    $("#popup").css("display", "none");
}

function dummy(){}
