import {api_url} from "../../../project_defaults";

class DrawingDataDownloader{
    // need to pass a callback as argument that will be called when the data is ready
    constructor(data_callback){
        this.cb = data_callback;
    }
    
    requestDrawings(){
        fetch(api_url+"/drawings/")
        .then(response => response.json())
        .then(data => {
            this.cb(data);
        }).catch(error => {
            console.log("There was an error");
            console.log(error);
        })
    }
}

export default DrawingDataDownloader;