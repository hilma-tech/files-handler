import React, { Component } from 'react';
import Dropzone from 'react-dropzone';
import Consts from '../../../consts/Consts';
import Tooltip from '@material-ui/core/Tooltip';
import './MultiImagesHandler.scss';

export default class MultiImagesHandler extends Component { // change "image" to "file"
    constructor(props) {
        super(props);

        this.state = {
            acceptedfilesPreviews: [],
            rejectedFilesPreviews: []
        };

        this.type = Object.keys(Consts.FILE_TYPES_AND_EXTENSIONS).includes(this.props.type) ? this.props.type : Consts.FILE_TYPE_IMAGE;
    }

    onDrop = async (acceptedfiles, rejectedFiles) => {
        let acceptedfilesPreviews = [];
        let rejectedFilesPreviews = [];
        let acceptedFilesObjs = [];

        for (let i = 0; i < acceptedfiles.length; i++) {
            let base64String = await this.readFileToBase64(acceptedfiles[i]);

            let fileObj = {
                src: base64String,
                type: this.type,
                title: this.props.title || "default_title",
                category: this.props.category || "default_category",
                description: this.props.description || "default_description",
                relatedModelToSaveImgId: this.props.relatedModelToSaveImgId || {}
            };

            acceptedfilesPreviews.push({ preview: base64String });
            acceptedFilesObjs.push(fileObj);
        }

        for (let i = 0; i < rejectedFiles.length; i++) {
            let base64String = await this.readFileToBase64(rejectedFiles[i]);
            rejectedFilesPreviews.push({ preview: base64String });
        }

        // Display previews of the accepted files
        this.setState({ acceptedfilesPreviews, rejectedFilesPreviews });

        // Calls the onChange callback
        let eventObj = { target: { name: this.props.name || "multiImagesHandler", value: acceptedFilesObjs } };
        this.props.onChange && this.props.onChange !== "function" && this.props.onChange(eventObj);
    };

    onDropAccepted = async (files) => {
        console.log("onDropAccepted", files)
        
    }

    onDropRejected = async (files) => {
        console.log("onDropRejected", files)
    }

    readFileToBase64 = (fileInfo) => {
        return new Promise((resolve, reject) => {
            if (fileInfo) {

                var FR = new FileReader();
                FR.addEventListener("load", function (e) {
                    resolve(e.target.result);
                });

                FR.readAsDataURL(fileInfo);
            }
            else reject("no file");
        })
    }

    getFilePreview = (file, errMsg = null) => {
        return (
            <div className="file-preview">
                <div className='thumb'>
                    <div className='thumb-inner'>
                        <img src={file.preview} />
                    </div>
                </div>
                <div className="remove-icon" onClick={this.removeFile}>
                    <img src={require('../../../imgs/x-icon.png')} alt="x" />
                </div>
                {errMsg &&
                    <div className="error-icon">
                        <Tooltip title={errMsg} placement="left" arrow>
                            <img src={require('../../../imgs/error.svg')} alt="error accepting the file" />
                        </Tooltip>
                    </div>}
            </div>
        )
    }

    render() {
        const acceptedfilesPreviews = this.state.acceptedfilesPreviews.map((file, i) => (
            <div key={i}>
                {this.getFilePreview(file)}
            </div>
        ));
        const rejectedFilesPreviews = this.state.rejectedFilesPreviews.map((file, i) => (
            <div key={i}>
                {this.getFilePreview(file, "error")}
            </div>
        ));

        return (
            <div className="multi-images-handler">
                <Dropzone
                    onDrop={this.onDrop}
                    onDropAccepted={this.onDropAccepted}
                    onDropRejected={this.onDropRejected}
                    accept={this.props.accept || `${this.type}/*`}
                    minSize={this.props.minSize || Consts.FILE_MIN_SIZE}
                    maxSize={this.props.maxSize || Consts.FILE_MAX_SIZE}
                    noClick={this.props.onClick}
                    noDrag={this.props.noDrag}
                    noKeyBoard={this.props.noKeyBoard}
                    disabled={this.props.disabled}>

                    {({ getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject }) => {
                        let classNames = `dropzone 
                        ${isDragActive && 'drag-active'} 
                        ${isDragAccept && 'drag-accept'} 
                        ${isDragReject && 'drag-reject'}`;

                        return (
                            <section className="container">
                                <div {...getRootProps({ className: classNames })}>
                                    <input {...getInputProps()} />
                                    <p>{this.props.label || "Drag & drop some files here, or click to select files"}</p>
                                </div>
                                <aside className='file-previews-container'>
                                    {acceptedfilesPreviews}
                                    {rejectedFilesPreviews}
                                </aside>
                            </section>)}}
                </Dropzone>
            </div>
        )
    }
}