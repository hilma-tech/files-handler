import React, { Component } from 'react';
import Dropzone from 'react-dropzone';
import Consts from '../../../consts/Consts.json';
import Tooltip from '@material-ui/core/Tooltip';
import './MultiImagesHandler.scss';

export default class MultiImagesHandler extends Component { // change "image" to "file"
    constructor(props) {
        super(props);

        this.state = {
            files: []
        };
        this.checkImgMinSize = this.props.checkImgMinSize || false;
        this.checkImgMaxSize = this.props.checkImgMaxSize || true;
        this.maxSize = this.props.maxSize || Consts.FILE_MAX_SIZE_IN_KB;

        this.type = Object.keys(Consts.FILE_TYPES_AND_EXTENSIONS_AND_MIMES).includes(this.props.type) ?
            this.props.type : Consts.FILE_TYPE_IMAGE;
        // this.minSizeInBytes = (this.props.minSizeInKB && this.props.minSizeInKB > Consts.FILE_MIN_SIZE_IN_KB ?
        //     this.props.minSizeInKB : Consts.FILE_MIN_SIZE_IN_KB) * 1000;
        this.maxSizeInBytes = (this.props.maxSizeInKB && this.props.maxSizeInKB < Consts.FILE_MAX_SIZE_IN_KB ?
            this.props.maxSizeInKB : Consts.FILE_MAX_SIZE_IN_KB) * 1000;
        // this.accept = this.props.accept && Array.isArray(this.props.accept) &&
        //     this.props.accept.every(extention => Object.keys(Consts.FILE_TYPES_AND_EXTENSIONS_AND_MIMES[this.type]).includes(extention) ?
        //         this.props.accept.joine(", ") : `${this.type}/*`;
    }

    onDrop = async (acceptedfiles, rejectedFiles) => {
        let files = [];
        let acceptedFilesObjs = [];

        for (let i = 0; i < acceptedfiles.length; i++) {
            let sizeKB = acceptedfiles[i] * 0.001;
            let base64String = await this.readFileToBase64(acceptedfiles[i]);

            let fileObj = {
                src: base64String,
                type: this.type,
                title: this.props.title || "default_title",
                category: this.props.category || "default_category",
                description: this.props.description || "default_description",
                relatedModelToSaveImgId: this.props.relatedModelToSaveImgId || {},
                checkImgMinSize: this.checkImgMinSize,
                checkImgMaxSize: this.checkImgMaxSize,
                maxSize: this.maxSize,
                size: sizeKB,
                multipleSizes: this.props.multipleSizes || false

            };

            files.push({ preview: base64String, status: Consts.FILE_ACCEPTED, errMsg: null });
            acceptedFilesObjs.push(fileObj);
        }

        for (let i = 0; i < rejectedFiles.length; i++) {
            let base64String = await this.readFileToBase64(rejectedFiles[i]);
            console.log("rejectedFiles[i]", rejectedFiles[i])
            files.push({ preview: base64String, status: Consts.FILE_REJECTED, errMsg: "erroe msg" });
        }

        // Display previews of dropped files
        this.setState({ files });

        // Calls the onChange callback with the accepted files
        let eventObj = { target: { name: this.props.name || "multiImagesHandler", value: acceptedFilesObjs } };
        this.props.onChange && this.props.onChange !== "function" && this.props.onChange(eventObj);
    };

    onDropAccepted = async (files) => {
        console.log("onDropAccepted", files)
    }

    onDropRejected = async (files) => {
        console.log("onDropRejected", files)
        console.log("max", this.maxSizeInBytes, "min", this.minSizeInBytes)
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

    getRejectedFileErrorMsg = (file) => {
        // if (file.size < this.minSizeInBytes) return "Error: the file is too small";
        if (file.size > this.maxSizeInBytes) return "Error: the file is too big";


        // let acceptedMimeTypes = this.props.accept.map(extention => {
        //     extention = extention.slice(1, extention.length);
        //     Consts.FILE_TYPES_AND_EXTENSIONS_AND_MIMES[extention] = 
        //     })
    }

    getFilePreview = (file) => {
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
                {file.status === Consts.FILE_REJECTED &&
                    <div className="error-icon">
                        <Tooltip title={file.errMsg} placement="left">
                            <img src={require('../../../imgs/error.svg')} alt="error accepting the file" />
                        </Tooltip>
                    </div>}
            </div>
        )
    }

    render() {
        const filePreviews = this.state.files.map((file, i) => (
            <div key={i}>
                {this.getFilePreview(file)}
            </div>
        ));

        return (
            <div className="multi-images-handler">
                <Dropzone
                    onDrop={this.onDrop}
                    onDropAccepted={this.onDropAccepted}
                    onDropRejected={this.onDropRejected}
                    accept={this.accept}
                    // minSize={this.minSizeInBytes}
                    maxSize={this.maxSizeInBytes}
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
                                    {filePreviews}
                                </aside>
                            </section>)
                    }}
                </Dropzone>
            </div>
        )
    }
}