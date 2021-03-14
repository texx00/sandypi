import "./UploadDrawing.scss";

import React, { Component } from 'react';
import { X } from 'react-bootstrap-icons';

import { domain } from '../../../utils/utils';

import Dropzone from 'react-dropzone';
import Modal from 'react-bootstrap/Modal';

import IconButton from "../../../components/IconButton";
import { ProgressBar } from "react-bootstrap";

class UploadDrawingsModal extends Component{

    constructor(props){
        super(props);
        this.state = {
            loading: false
        };
        this.files = undefined;
        this.isLoading = false;
    }

    static defaultProps = {
        playlist: 0,
        show: false
    }

    componentDidUpdate(){
        if (this.state.loading && !this.isLoading){
            this.isLoading = true;
            let promises = this.files.map(f => {
                let data = new FormData();
                data.append("file", f);
                data.append("filename", f.name);
                return fetch(domain + "/api/upload/", {
                    method: "POST",
                    body: data
                }).then((response => {
                    if (response.status === 200){
                        window.showToast("Drawing \""+f.name+"\" uploaded successfully");
                    }else{
                        window.showToast("There was a problem when uploading \""+f.name+"\"");
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
    }

    handleClose(){
        this.isLoading = false;
        this.setState({...this.state, loading: false});
        this.props.handleClose();
    }

    handleFiles(files){
        this.files = files;
        this.setState({...this.state, loading: true});
    }

    render(){
        // TODO add thr files upload if necessary... Need somebody to try it out first
        return <Modal show={this.props.show} onHide={this.handleClose.bind(this)} size="lg" centered>
            <Modal.Header className="center">
                <Modal.Title>Upload new drawing</Modal.Title>
            </Modal.Header>
            <Modal.Body className="center">
                <div className={ "w-100" + (this.state.loading ? " d-none" : "")}>
                    <Dropzone
                        onDrop={this.handleFiles.bind(this)} 
                        accept={".gcode"}       
                        noKeyboard>
                        {({getRootProps, getInputProps, isDragActive}) => (<div {...getRootProps()} className={"animated-background m-2 p-5 mh-100 d-flex justify-content-center align-items-center" + (isDragActive ? " drag-active" : "")}>
                            <input {...getInputProps()}/>
                            <div className="d-block text-center">Drag and drop the .gcode file here <br/>or click to open the file explorer
                                </div>
                            </div>)}
                    </Dropzone>
                </div>
                <div className={"p-5 w-100" + (this.state.loading ? "" : " d-none")}>
                    <ProgressBar
                        className={"w-100"}
                        now={100}
                        label={"Loading..."}
                        animated/>
                </div>
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