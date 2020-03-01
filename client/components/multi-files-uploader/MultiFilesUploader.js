import React, { Component } from 'react';
import Dropzone from 'react-dropzone';
import Consts from '../../../consts/Consts.json';
import Tooltip from '@material-ui/core/Tooltip';
import './MultiFilesUploader.scss';

export default class MultiFilesUploader extends Component {
    constructor(props) {
        super(props);

        this.state = {
            filesData: []
        };

        this.filesPreviews = [];

        this.type = Object.keys(Consts.FILE_TYPES_AND_EXTENSIONS_AND_MIMES).includes(this.props.type) ?
            this.props.type : Consts.FILE_TYPE_IMAGE;

        this.acceptedExtensions = this.getAcceptedExtensions();
        this.acceptedMimes = this.getAcceptedMimes();

        this.maxSize = this.props.maxSize || Consts.FILE_MAX_SIZE_IN_KB;
        this.maxSizeInBytes = (this.props.maxSizeInKB && this.props.maxSizeInKB < Consts.FILE_MAX_SIZE_IN_KB ?
            this.props.maxSizeInKB : Consts.FILE_MAX_SIZE_IN_KB) * 1000;

        this.checkImgMinSize = this.props.checkImgMinSize || false;
        this.checkImgMaxSize = this.props.checkImgMaxSize || true;
    }

    onDrop = async (acceptedfiles, rejectedFiles) => {
        console.log("acceptedfiles", acceptedfiles)
        console.log("rejectedFiles", rejectedFiles)

        let filesData = [...this.state.filesData];

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

            let filePreview = await this.getFilePreviewObj(acceptedfiles[i], base64String, Consts.FILE_ACCEPTED);

            filesData.push({ previewObj: filePreview, acceptedObj: fileObj });
        }

        for (let i = 0; i < rejectedFiles.length; i++) {
            if (!this.acceptedMimes.includes(rejectedFiles[i].type)) continue;

            let filePreview = await this.getFilePreviewObj(rejectedFiles[i], null, Consts.FILE_REJECTED, Consts.ERROR_MSG_FILE_TOO_BIG);

            filesData.push({ previewObj: filePreview });
        }

        // Display previews of dropped files
        this.setState({ filesData }, this.parentOnChange);

        // Calls the onChange callback with the accepted files
    };

    getAcceptedFilesObjs = (filesData) => {
        let acceptedFilesObj = [];

        for (let i = 0; i < filesData.length; i++) {
            if (filesData[i].acceptedObj)
                acceptedFilesObj.push(filesData[i].acceptedObj);
        }

        return acceptedFilesObj;
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

    getAcceptedExtensions = () => {
        let accept = Object.keys(Consts.FILE_TYPES_AND_EXTENSIONS_AND_MIMES[this.type]);
        accept = "." + accept.join(", .");
        return accept;
    }

    getAcceptedMimes = () => {
        let extensions = Object.keys(Consts.FILE_TYPES_AND_EXTENSIONS_AND_MIMES[this.type]);
        let mimes = extensions.map(extension => Consts.FILE_TYPES_AND_EXTENSIONS_AND_MIMES[this.type][extension]);
        return mimes;
    }

    getExtension = (mime) => {
        let extensionsAndMimesOfType = Consts.FILE_TYPES_AND_EXTENSIONS_AND_MIMES[this.type];
        let extensions = Object.keys(extensionsAndMimesOfType);
        let extension = extensions.find(extension => extensionsAndMimesOfType[extension] === mime);
        return extension;
    }

    getFilePreviewObj = async (file, base64String = null, status, errMsg = null) => {
        let preview = null;
        let extension = null;

        if (this.type === Consts.FILE_TYPE_FILE) {
            preview = file.name;
            extension = this.getExtension(file.type);
        }
        else {
            if (!base64String) base64String = await this.readFileToBase64(file);
            preview = base64String;
        }

        let filePreview = {
            preview: preview,
            extension: extension,
            status: status,
            errMsg: errMsg
        };

        return filePreview;
    }

    getFilePreview = (file, index) => {
        let filePreview = null;

        switch (this.type) {
            case Consts.FILE_TYPE_FILE:
                filePreview =
                    <div>
                        <img src={require(`../../../imgs/fileThumbnails/${file.extension}-file-thumbnail.svg`)} />
                        <h2>{file.preview.length <= 11 ? file.preview : (file.preview.slice(0, 8) + "...")}</h2>
                    </div>;
                break;

            case Consts.FILE_TYPE_IMAGE:
                filePreview = <img src={file.preview} />;
                break;


            case Consts.FILE_TYPE_VIDEO:
                filePreview = <video src={file.preview} type={"video/*"} />;
                break;


            case Consts.FILE_TYPE_AUDIO:
                filePreview = <audio controls src={file.preview} type={"audio/*"} />;
                break;


            default:
                filePreview = null;
                break;
        }

        return (
            <div className="file-preview ">
                <div className={`thumb ${this.type}-thumb`}>
                    <div className='thumb-inner'>
                        {filePreview}
                    </div>
                </div>
                <div className="remove-icon" onClick={() => this.removeFile(index)}>
                    <img src={require('../../../imgs/x-icon.png')} alt="x" />
                </div>
                {file.status === Consts.FILE_REJECTED &&
                    <div className="error-icon">
                        <Tooltip title={file.errMsg} placement="left" classes="tool-tip">
                            <img src={require('../../../imgs/error.svg')} alt={file.errMsg} />
                        </Tooltip>
                    </div>}
            </div>
        )
    }


    removeFile = (fileIndex) => {
        let filesData = this.state.filesData;
        filesData.splice(fileIndex, 1);
        this.setState({ filesData }, this.parentOnChange);
    }

    parentOnChange = () => {
        // Calls the onChange callback with the accepted files
        let eventObj = { target: { name: this.props.name || "multiImagesHandler", value: this.getAcceptedFilesObjs(this.state.filesData) } };
        this.props.onChange && this.props.onChange !== "function" && this.props.onChange(eventObj);
    }

    render() {
        /* After every drop, the component is rendered twicw due to usage of Dropzone,
        the following condition is to prevent unnecessary updates of filesPreviews */
        this.filesPreviews = this.state.filesData.length !== this.filesPreviews.length ?
            this.state.filesData.map((file, i) => (
                <div key={i}>
                    {this.getFilePreview(file.previewObj, i)}
                </div>
            )) : this.filesPreviews;

        return (
            <div className="multi-files-uploader">
                <Dropzone
                    onDrop={this.onDrop}
                    accept={this.acceptedExtensions}
                    maxSize={this.maxSizeInBytes}
                    noClick={this.props.onClick}
                    noDrag={this.props.noDrag}
                    noKeyBoard={this.props.noKeyBoard}
                    disabled={this.props.disabled}>

                    {({ getRootProps, getInputProps, isDragActive }) => {
                        let classNames = `dropzone ${isDragActive && 'drag-active'} `;

                        return (
                            <section className="container">
                                <div {...getRootProps({ className: classNames })}>
                                    <input {...getInputProps()} />
                                    <p>{this.props.label || "Drag & drop some files here, or click to select files"}</p>
                                </div>
                                <aside className='file-previews-container'>
                                    {this.filesPreviews}
                                </aside>
                            </section>)
                    }}
                </Dropzone>
            </div>
        )
    }
}