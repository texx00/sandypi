import "./UploadDrawing.scss";

import React, { Component } from 'react';
import { X } from 'react-bootstrap-icons';

import { domain } from '../../../utils/utils';

import Dropzone from 'react-dropzone';
import Modal from 'react-bootstrap/Modal';

import IconButton from "../../../components/IconButton";

class UploadDrawingsModal extends Component{

    constructor(props){
        super(props);
        this.state = {loading: false};
    }

    static defaultProps = {
        playlist: 0,
        show: false
    }

    handleClose(){
        this.setState({...this.state, loading: false});
        this.props.handleClose();
    }

    handleFiles(files){
        this.setState({...this.state, loading: true});

        let promises = files.map(f => {
            let data = new FormData();
            data.append("file", f);
            data.append("filename", f.name);
            return fetch(domain + "/api/upload/", {
                method: "POST",
                body: data
            }).then((response => {
                if (response.status === 200){
                    window.show_toast("Drawing \""+f.name+"\" uploaded successfully");
                }else{
                    window.show_toast("There was a problem when uploading \""+f.name+"\"");
                }
                return response.json();
            })).then((data => {
                return data
            })).catch((error)=>{
                console.error(error);
            });
        });
        // wait until all file have been laoaded to refresh the list
        Promise.all(promises)
        .then((ids)=>{
            this.props.handleFileUploaded(ids);
            this.handleClose();
        });
    }

    render(){
        // TODO fix the "loading" state visualization
        return <Modal show={this.props.show} onHide={this.handleClose.bind(this)} size="lg" centered>
            <Modal.Header className="center">
                <Modal.Title>Upload new drawing</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Dropzone className={() => {return this.state.loading ? "d-none" : ""}}
                    onDrop={this.handleFiles.bind(this)} 
                    accept={".gcode"}
                    noKeyboard>
                    {({getRootProps, getInputProps, isDragActive}) => (<div {...getRootProps()} className={"animated-background m-2 p-5 mh-100 d-flex justify-content-center align-items-center" + (isDragActive ? " drag-active" : "")}>
                        <input {...getInputProps()}/>
                        <div className="d-block text-center">Drag and drop the .gcode/.nc file here <br/>or click to open the file explorer
                            </div>
                        </div>)}
                </Dropzone>
                <div className={() => {return this.state.loading ? "" : "d-none"}}>Loading</div>
            </Modal.Body>
            <Modal.Footer className="center">
                <IconButton 
                    className="btn"
                    icon={X}
                    onClick={this.handleClose.bind(this)}>
                    Undo
                </IconButton>
            </Modal.Footer>
        </Modal>
    }
}

export default UploadDrawingsModal;