/*
 * Compiling react pages on the raspberry directly can be very slow.
 * To compile the frontend "offline" but still be able to connect to the raspberry server it is possible to use the "REACT_APP_SERVER_IP" environment variable before calling "yarn start":
 *  - Windows (cmd): $> set "REACT_APP_SERVER_IP=xxx.xxx.xxx.xxx" && yarn start
 *  - Linux:$> REACT_APP_SERVER_IP=xxx.xxx.xxx.xxx yarn start
 * The variable will be used only in development, not for the build process
*/
function getWorkingDomain(){
    console.log(process.env.REACT_APP_SERVER_IP);
    if(process.env.REACT_APP_SERVER_IP !== undefined)
        return document.location.protocol + '//' + process.env.REACT_APP_SERVER_IP + ":5000";
    else return document.location.protocol + '//' + document.domain + ":5000";
}

const domain = getWorkingDomain();

// removes undefined and null values from an array
function checkArray(arr){
    return arr.filter((el) => el !== null && el !== undefined);
}

// get the url of given images
function getImgUrl(id){
    if (id !== undefined)
        return domain + "/Drawings/" + id;
    else return "";
}

export { domain, getImgUrl, checkArray };