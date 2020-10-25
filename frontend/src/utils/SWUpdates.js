import {setCookie} from './Cookies';
import {socket} from "../SAC";


function check_software_updates(){
    console.log("Checking for updates");
    socket.on("software_updates_response", (response) =>{
        window.show_toast(response, 10000);
    });
    function send_check(){
        setCookie("check_update", "", 7);  // the cookie expires after 7 days
        socket.emit("software_updates_check");
    }
    // TODO add a cookie disclaimer?
    if (!document.cookie.split(';').some((item) => item.trim().startsWith('check_update='))) {
        console.log('The cookie "check_update" doesn\'t exists (ES6)')
        send_check()
    }else{
        console.log("The cookie exists")
    }
}

export {check_software_updates};