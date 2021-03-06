import React, { Component } from 'react';
import Dropzone from 'react-dropzone';
import Consts from '../../../consts/Consts.json';
import { fileshandler as config } from '../../../../../consts/ModulesConfig';
import Tooltip from '@material-ui/core/Tooltip';
import FixImgOrientation from '../FixImgOrientation';
import './MultiFilesUploader.scss';

export default class MultiFilesUploader extends Component {
    constructor(props) {
        super(props);

        this.state = {
            filesData: []
        };

        this.filesPreviews = [];
        this.isOverFilesNumLimit = false;

        this.type = Consts.FILE_TYPES.includes(this.props.type) ?
            this.props.type : Consts.FILE_TYPE_IMAGE;

        this.acceptedExtensions = this.getAcceptedExtensions();
        this.acceptedMimes = this.getAcceptedMimes();

        this.minSizeInBytes = (this.props.minSizeInKB && this.props.minSizeInKB > config.FILE_SIZE_RANGE_IN_KB[this.type].MIN_SIZE ?
            this.props.minSizeInKB : config.FILE_SIZE_RANGE_IN_KB[this.type].MIN_SIZE) * 1000;

        this.maxSizeInBytes = (this.props.maxSizeInKB && this.props.maxSizeInKB < config.FILE_SIZE_RANGE_IN_KB[this.type].MAX_SIZE ?
            this.props.maxSizeInKB : config.FILE_SIZE_RANGE_IN_KB[this.type].MAX_SIZE) * 1000;
    }

    onDrop = async (acceptedfiles, rejectedFiles) => {
        let filesData = [...this.state.filesData];

        for (let i = 0; i < acceptedfiles.length; i++) {
            if (filesData.length >= config.MULTI_FILES_LIMIT) { this.isOverFilesNumLimit = true; break; }
            let base64String;
            //if image => get base64 of image on canvas with orientation 1 
            if (this.props.type === Consts.FILE_TYPE_IMAGE)
                base64String = await FixImgOrientation.resetOrientation(acceptedfiles[i]);
            //if audio/file => get base64 
            else this.readFileToBase64(acceptedfiles[i]);

            let fileObj = {
                src: base64String,
                type: this.type,
                title: this.props.title || "default_title",
                category: this.props.category || "default_category",
                description: this.props.description || "default_description",
                isMultiSizes: this.props.isMultiSizes || false
            };

            let filePreview = await this.getFilePreviewObj(acceptedfiles[i], base64String, Consts.FILE_ACCEPTED);

            filesData.push({ previewObj: filePreview, acceptedObj: fileObj });
        }

        for (let i = 0; i < rejectedFiles.length; i++) {
            if (filesData.length >= config.MULTI_FILES_LIMIT) { this.isOverFilesNumLimit = true; break; }
            if (!this.acceptedMimes.includes(rejectedFiles[i].type)) continue;

            let [status, errMsg] = this.isFileInSizeRange(rejectedFiles[i]);

            let filePreview = await this.getFilePreviewObj(rejectedFiles[i], null, Consts.FILE_REJECTED, errMsg);

            filesData.push({ previewObj: filePreview });
        }

        // Display previews of dropped files and calls the onChange callback with the accepted files
        this.setState({ filesData }, this.parentOnChange);
    };

    //resize large image to the large size given in config.IMAGE_SIZES_IN_PX
    resizeLargeImage = (file, base64) => {
        return new Promise((resolve, reject) => {
            const maxWidth = config.IMAGE_SIZES_IN_PX['l'] ? config.IMAGE_SIZES_IN_PX['l'] : 1000;

            const maxHeight = 500;
            var canvas = document.createElement("canvas");
            var ctx = canvas.getContext("2d");
            var canvasCopy = document.createElement("canvas");
            var copyContext = canvasCopy.getContext("2d");

            // Create original image
            var img = new Image();
            img.src = base64;
            img.onload = function () {
                // Determine new ratio based on max size
                var ratio = 1;
                if (img.width > maxWidth)
                    ratio = maxWidth / img.width;
                else if (img.height > maxHeight)
                    ratio = maxHeight / img.height;

                // Draw original image in second canvas
                canvasCopy.width = img.width;
                canvasCopy.height = img.height;
                copyContext.drawImage(img, 0, 0);

                // Copy and resize second canvas to first canvas
                //the first canvas has smaller width and height than the original image
                canvas.width = img.width * ratio;
                canvas.height = img.height * ratio;

                ctx.drawImage(canvasCopy, 0, 0, canvasCopy.width, canvasCopy.height, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL(file.type));
                reject(base64);
            };
        });
    }

    isFileInSizeRange = (file, isDefaultChosenFile = false) => {
        let status = Consts.FILE_ACCEPTED;
        let errMsg = null;

        if (isDefaultChosenFile) {
            return [status, errMsg];
        }

        let sizeKB = file.size;
        if (sizeKB < this.minSizeInBytes) {
            status = Consts.FILE_REJECTED;
            errMsg = Consts.ERROR_MSG_FILE_TOO_SMALL;
        }
        if (sizeKB > this.maxSizeInBytes) {
            status = Consts.FILE_REJECTED;
            errMsg = Consts.ERROR_MSG_FILE_TOO_BIG;
        }

        return [status, errMsg];
    }

    getFilesData = () => {
        let filesData = this.state.filesData;
        let acceptedFilesObj = [];
        let isThereRejectedFiles = false;

        for (let i = 0; i < filesData.length; i++) {
            if (filesData[i].acceptedObj)
                acceptedFilesObj.push(filesData[i].acceptedObj);
            else isThereRejectedFiles = true;
        }

        return [acceptedFilesObj, isThereRejectedFiles];
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
        let accept = Consts.FILE_EXTENSIONS[this.type];
        accept = "." + accept.join(", .");
        return accept;
    }

    getAcceptedMimes = () => {
        let extensions = Consts.FILE_EXTENSIONS[this.type];
        let mimes = [];
        for (let i = 0; i <= extensions.length; i++) {
            let extension = extensions[i];
            let mimeOrMimes = Consts.FILE_MIMES[extension];
            if (Array.isArray(mimeOrMimes)) mimes = [...mimes, ...mimeOrMimes];
            else mimes.push(mimeOrMimes);
        }
        return mimes;
    }

    getExtension = (mime) => {
        let extensions = Consts.FILE_EXTENSIONS[this.type];
        for (let extension of extensions) {
            let mimeOrMimes = Consts.FILE_MIMES[extension];
            if (Array.isArray(mimeOrMimes)) {
                if (mimeOrMimes.includes(mime)) return extension;
                continue;
            }
            if (mimeOrMimes === mime) return extension;
        }
        return null;
    }

    getFilePreviewObj = async (file, base64String = null, status, errMsg = null) => {
        let preview = null;
        let extension = null;

        if (this.type === Consts.FILE_TYPE_FILE) {
            preview = file.name;
            extension = this.getExtension(file.type);
        }
        else {
            if (!base64String) {
                //if image => get base64 of image on canvas with orientation 1 
                if (this.props.type === Consts.FILE_TYPE_IMAGE) {
                    base64String = await FixImgOrientation.resetOrientation(file);
                    if (config.SHRINK_LARGE_IMAGE_TO_MAX_SIZE && errMsg === Consts.ERROR_MSG_FILE_TOO_BIG) {
                        //resize the image to smaller size and don't show the error message
                        errMsg = null;
                        status = Consts.FILE_ACCEPTED;
                        base64String = await this.resizeLargeImage(file, base64String);
                    }
                }
                //if audio/file => get base64 
                else base64String = await this.readFileToBase64(file);
            }
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
                {!this.props.disabled && <div className="remove-icon" onClick={() => this.removeFile(index)}>
                    <img src={require('../../../imgs/x-icon.png')} alt="x" />
                </div>}
                {file.status === Consts.FILE_REJECTED &&
                    <div className="error-icon">
                        <Tooltip title={file.errMsg} placement="left" className="tool-tip">
                            <img src={require('../../../imgs/error.svg')} alt={file.errMsg} />
                        </Tooltip>
                    </div>}
            </div>
        )
    }

    removeFile = (fileIndex) => {
        let filesData = this.state.filesData;
        filesData.splice(fileIndex, 1);
        if (filesData.length < config.MULTI_FILES_LIMIT) this.isOverFilesNumLimit = false;
        this.setState({ filesData }, this.parentOnChange);
    }

    parentOnChange = () => {
        let [acceptedFilesObj, isThereRejectedFiles] = this.getFilesData();

        let errorMsg = null;
        if (this.isOverFilesNumLimit) errorMsg = Consts.ERROR_MSG_FILES_NUM_LIMIT.replace('%', config.MULTI_FILES_LIMIT);
        else if (isThereRejectedFiles) errorMsg = Consts.ERROR_MSG_SOME_FILES;

        let eventObj = {
            target: {
                name: this.props.name || "multiFilesUploader",
                value: acceptedFilesObj
            },
            error: errorMsg
        };

        // Calls the onChange callback with the accepted files ang an errMsg if there was rejected files
        this.props.onChange && this.props.onChange !== "function" && this.props.onChange(eventObj);
    }

    replaceAll = (str, a, b) => {
        return str.split(a).join(b);
    }

    render() {
        /* After every drop, the component is rendered twice due to usage of Dropzone,
        the following condition is to prevent unnecessary updates of filesPreviews */
        this.filesPreviews = this.state.filesData.length !== this.filesPreviews.length || this.props.disabled ?
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
                    minSize={this.minSizeInBytes}
                    maxSize={this.maxSizeInBytes}
                    noClick={this.props.noClick}
                    noDrag={this.props.noDrag}
                    noKeyBoard={this.props.noKeyBoard}
                    disabled={this.props.disabled || this.isOverFilesNumLimit}>

                    {({ getRootProps, getInputProps, isDragActive }) => {
                        let classNames = `dropzone ${isDragActive && 'drag-active'}`;

                        return (
                            <section className="container">
                                <div {...getRootProps({ className: classNames })}>
                                    <input {...getInputProps()} />
                                    <p>{this.isOverFilesNumLimit ?
                                        Consts.ERROR_MSG_FILES_NUM_LIMIT.replace('%', config.MULTI_FILES_LIMIT) :
                                        (this.props.label || this.replaceAll(Consts.MULTI_FILES_DEFAULT_MSG, '%', this.type))}</p>
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