import "./UploadDrawing.scss";

import React, { Component } from 'react';

import {api_url} from "../../../project_defaults";

import Dropzone from 'react-dropzone';
import Modal from 'react-bootstrap/Modal';

class UploadDrawingsModal extends Component{

    static defaultProps = {
        playlist: 0,
        show: false
    }

    handleClose(){
        this.props.handleClose();
    }

    handleFiles(files){
        let promises = files.map(f => {
            let data = new FormData();
            data.append("file", f);
            data.append("filename", f.name);
            return fetch(api_url + "/upload/" + this.props.playlist, {
                method: "POST",
                body: data
            }).then((response => {
                if (response.status === 200){
                    window.show_toast("Drawing \""+f.name+"\" uploaded successfully");
                }else{
                    window.show_toast("There was a problem when uploading \""+f.name+"\"");
                }
            }));
        });
        // wait until all file have been laoaded to refresh the list
        Promise.all(promises)
        .then(()=>{this.props.handleFileUploaded()});

        this.handleClose();
    }

    render(){
        return <Modal show={this.props.show} onHide={this.handleClose.bind(this)} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title >Upload new drawing</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Dropzone 
                    onDrop={this.handleFiles.bind(this)} 
                    accept={".gcode"}
                    noKeyboard>
                    {({getRootProps, getInputProps, isDragActive}) => (<div {...getRootProps()} className={"animated-background m-2 p-5 mh-100 d-flex justify-content-center align-items-center" + (isDragActive ? " drag-active" : "")}>
                        <input {...getInputProps()}/>
                        <div className="d-block text-center">Drag and drop the .gcode/.nc file here <br/>or click to open the file explorer
                            </div>
                        </div>)}
                </Dropzone>
            </Modal.Body>
        </Modal>
    }
}

export default UploadDrawingsModal;