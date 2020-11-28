

const api_url = "http://localhost:5000/api";

const static_url = "http://localhost:5000/static";

function getImgUrl(id){
    if (id !== undefined)
        return static_url + "/Drawings/" + id + "/" + id + ".jpg";
    else return "";
}

export {api_url, getImgUrl, static_url};