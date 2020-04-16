import React, { Component } from 'react';
import Consts from '../../../consts/Consts.json';
import { fileshandler as config } from '../../../../../consts/ModulesConfig';
import Tooltip from '@material-ui/core/Tooltip';
import './SingleFileUploader.scss';

export default class SingleFileUploader extends Component {
    constructor(props) {
        super(props);

        this.initialValues(props);
        let defaltPreviewObj = this.getFilePreviewObj(null, this.defaultTumbnail, Consts.DEFAULT_THUMBNAIL);

        this.state = {
            fileData: { previewObj: defaltPreviewObj, acceptedObj: null }
        };

        this.onChange = this.onChange.bind(this); // Intentionally bind instead of arrow function
    }

    initialValues = (props) => {
        this.defaultTumbnail = this.getDefaultThumbnail();

        this.type = Consts.FILE_TYPES.includes(props.type) ?
            props.type : Consts.FILE_TYPE_IMAGE;

        this.acceptedExtensions = this.getAcceptedExtensions();

        this.minSizeInKB = props.minSizeInKB && props.minSizeInKB > config.FILE_SIZE_RANGE_IN_KB[this.type].MIN_SIZE ?
            props.minSizeInKB : config.FILE_SIZE_RANGE_IN_KB[this.type].MIN_SIZE;

        this.maxSizeInKB = props.maxSizeInKB && props.maxSizeInKB < config.FILE_SIZE_RANGE_IN_KB[this.type].MAX_SIZE ?
            props.maxSizeInKB : config.FILE_SIZE_RANGE_IN_KB[this.type].MAX_SIZE;
    }

    // componentWillReceiveProps(nextProps) {
    //     if (nextProps.type !== this.props.type) {
    //         this.initialValues(nextProps);
    //         let defaltPreviewObj = this.getFilePreviewObj(null, this.defaultTumbnail, Consts.DEFAULT_THUMBNAIL);
    //         this.setState({ fileData: { previewObj: defaltPreviewObj, acceptedObj: null } });
    //     }
    //     return true;
    // }

    getDefaultThumbnail = () => {
        // Suppport previous versions
        let propsDefaultTumbnail = this.props.defaultValue || this.props.thumbnail || this.props.defaultThumbnailImageSrc;
        let defaultThumbnail = propsDefaultTumbnail || require(`../../../imgs/fileThumbnails/upload-file-thumbnail.svg`);
        return defaultThumbnail;
    }

    async onChange(e) {
        if (!e.target || !e.target.files || !e.target.files[0]) return;
        let file = e.target.files[0];

        let base64String = null;
        let fileObj = null;
        let filePreview = null;
        let [status, errMsg] = this.isFileInSizeRange(file);

        if (status === Consts.FILE_ACCEPTED) {
            base64String = await this.readFileToBase64(file);
            fileObj = {
                src: base64String,
                type: this.type,
                title: this.props.title || "default_title",
                category: this.props.category || "default_category",
                description: this.props.description || "default_description",
                isMultiSizes: this.props.isMultiSizes || false
            };
        }

        if (!base64String && this.type !== Consts.FILE_TYPE_FILE && !this.props.isErrorPopup) base64String = await this.readFileToBase64(file);

        if (this.props.isErrorPopup && status === Consts.FILE_REJECTED)
            filePreview = this.getFilePreviewObj(null, this.defaultTumbnail, status, errMsg);
        else filePreview = this.getFilePreviewObj(file, base64String, status, errMsg);

        let fileData = { previewObj: filePreview, acceptedObj: fileObj };

        // Display previews of dropped files and calls the onChange callback with the accepted files
        this.setState({ fileData }, this.parentOnChange);
    }

    parentOnChange = () => {
        // Calls the onChange callback with the accepted files
        let eventObj = { target: { name: this.props.name || "singleFileUploader", value: this.state.fileData.acceptedObj || null } };
        this.props.onChange && this.props.onChange !== "function" && this.props.onChange(eventObj);
    }

    isFileInSizeRange = (file) => {
        let status = Consts.FILE_ACCEPTED;
        let errMsg = null;

        let sizeKB = file.size * 0.001;
        if (sizeKB < this.minSizeInKB) {
            status = Consts.FILE_REJECTED;
            errMsg = Consts.ERROR_MSG_FILE_TOO_SMALL;
        }
        if (sizeKB > this.maxSizeInKB) {
            status = Consts.FILE_REJECTED;
            errMsg = Consts.ERROR_MSG_FILE_TOO_BIG;
        }

        return [status, errMsg];
    }

    readFileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            if (file) {
                var FR = new FileReader();
                FR.addEventListener("load", function (e) {
                    resolve(e.target.result);
                });

                FR.readAsDataURL(file);
            }
            else reject("ERROR: No file accepted");
        })
    }

    getFilePreviewObj = (file = null, base64String = null, status, errMsg = null) => {
        let preview = null;
        let extension = null;

        if (!(this.props.isErrorPopup && status === Consts.FILE_REJECTED)){
        if (this.type === Consts.FILE_TYPE_FILE && status !== Consts.DEFAULT_THUMBNAIL) {
            preview = file.name;
            extension = this.getExtension(file.type);
            console.log("extension", extension);
        }
        else {
            preview = base64String;
        }}

        let filePreview = {
            preview: preview,
            extension: extension,
            status: status,
            errMsg: errMsg
        };

        console.log("this.props.isErrorPopup", this.props.isErrorPopup, filePreview)
        return filePreview;
    }

    getFilePreviewHtml = (file) => {
        let filePreview = null;
        let type = file.status === Consts.DEFAULT_THUMBNAIL ? Consts.FILE_TYPE_IMAGE : this.type;

        switch (type) {
            case Consts.FILE_TYPE_FILE:
                filePreview =
                    <div ref={this.props.previewRef}>
                        <img src={require(`../../../imgs/fileThumbnails/${file.extension}-file-thumbnail.svg`)} alt={`uploading ${this.type}`} />
                        <h2>{file.preview}</h2>
                    </div>;
                break;

            case Consts.FILE_TYPE_IMAGE:
                let style = { backgroundImage: `url(${file.preview})` };
                filePreview = <div ref={this.props.previewRef} className="chosen-img" style={style} />;
                break;

            case Consts.FILE_TYPE_VIDEO:
                filePreview = <video ref={this.props.previewRef} src={file.preview} type={"video/*"} />;
                break;

            case Consts.FILE_TYPE_AUDIO:
                filePreview = <audio ref={this.props.previewRef} controls src={file.preview} type={"audio/*"} />;
                break;

            default: break;
        }

        return (
            <div className={`thumb ${type}-thumb`}>
                {filePreview}
            </div>
        )
    }

    removeFile = () => {
        if (this.state.fileData.previewObj.state === Consts.DEFAULT_THUMBNAIL) return;
        this.refs.uploaderInputRef.value = null;
        let defaltPreviewObj = this.getFilePreviewObj(null, this.defaultTumbnail, Consts.DEFAULT_THUMBNAIL);
        let fileData = { previewObj: defaltPreviewObj, acceptedObj: null };
        this.setState({ fileData }, this.parentOnChange);
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

    getAcceptedExtensions = () => {
        let accept = Consts.FILE_EXTENSIONS[this.type];
        accept = "." + accept.join(", .");
        return accept;
    }

    render() {
        let file = this.state.fileData.previewObj;
        let filePreviewHtml = this.getFilePreviewHtml(file);
        let type = file.status === Consts.DEFAULT_THUMBNAIL ? Consts.FILE_TYPE_IMAGE : this.type;

        return (
            <div className="single-file-uploader">
                <div className="basic-theme">
                    <input
                        id={this.props.name}
                        name={this.type}
                        type="file"
                        onChange={this.onChange}
                        disabled={this.props.disabled}
                        required={this.props.required || false}
                        accept={this.acceptedExtensions}
                        ref="uploaderInputRef" />

                    <div className={`single-file-preview ${type}-preview`}>
                        <label htmlFor={this.props.name}>
                            {filePreviewHtml}
                            <div className="label">{this.props.label || `Choose ${this.type}`}</div>
                        </label>

                        {// Add remove button
                            !this.props.disabled && file.status !== Consts.DEFAULT_THUMBNAIL &&
                            <div className="remove-icon" onClick={this.removeFile}>
                                <img src={this.props.removeFileIcon || require('../../../imgs/x-icon.png')} alt="x" />
                            </div>}

                        {// Add error icon if needed
                            file.status === Consts.FILE_REJECTED &&
                            <div className="error-icon">
                                <Tooltip title={file.errMsg} placement="left" classes="tool-tip">
                                    <img src={require('../../../imgs/error.svg')} alt={file.errMsg} />
                                </Tooltip>
                            </div>}
                    </div>
                </div>
            </div>
        )
    }
}