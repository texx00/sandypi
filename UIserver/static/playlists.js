function show_dropzone(){
    var floater = document.getElementById("floater");
    floater.style.display = 'block';
    floater.setAttribute("onclick", "hide_dropzone()");
}

function hide_dropzone(){
    var floater = document.getElementById("floater");
    floater.style.display = 'none';
}