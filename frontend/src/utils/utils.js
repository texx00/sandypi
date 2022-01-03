/*
 * Compiling react pages on the raspberry directly can be very slow.
 * To compile the frontend "offline" but still be able to connect to the raspberry server it is possible to use the "REACT_APP_SERVER_IP" environment variable before calling "yarn start":
 *  - Windows (cmd): $> set "REACT_APP_SERVER_IP=xxx.xxx.xxx.xxx" && yarn start
 *  - Linux:$> REACT_APP_SERVER_IP=xxx.xxx.xxx.xxx yarn start
 * The variable will be used only in development, not for the build process
*/
function getWorkingDomain(){
    if (process.env.REACT_APP_DEVELOPMENT_SERVER !== undefined){
        console.log("Using REACT_APP_DEVELOPMENT_SERVER environmental variable: " + process.env.REACT_APP_DEVELOPMENT_SERVER);
        return document.location.protocol + '//' + process.env.REACT_APP_DEVELOPMENT_SERVER;
    }
    return document.location.protocol + '//' + document.domain + ":" + document.location.port;
}

const domain = getWorkingDomain();

// removes undefined and null values from an array
function checkArray(arr){
    return arr.filter((el) => el !== null && el !== undefined);
}

// get the url of given images
function getImgUrl(id){
    if (id !== undefined)
        return domain + "/Drawings/" + id + "?v=" + process.env.REACT_APP_VERSION;  // adding version to automatically reload the images when a new version of the sofware is installed
    else return "";
}

const home_site = "https://github.com/texx00/sandypi";

export { domain, getImgUrl, checkArray, home_site };