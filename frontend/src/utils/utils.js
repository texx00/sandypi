import { static_url } from '../project_defaults';

// removes undefined and null values from an array
function checkArray(arr){
    return arr.filter((el) => el !== null && el !== undefined);
}

// get the url of given images
function getImgUrl(id){
    if (id !== undefined)
        return static_url + "/Drawings/" + id + "/" + id + ".jpg";
    else return "";
}

export { getImgUrl, checkArray };