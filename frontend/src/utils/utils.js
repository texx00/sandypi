const domain = document.location.protocol + '//' + document.domain + ":5000";

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