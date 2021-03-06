import React, { Component } from 'react';
import Consts from '../../../consts/Consts.json';
import { fileshandler as config } from '../../../../../consts/ModulesConfig';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Tooltip from '@material-ui/core/Tooltip';
import ErrorPopup from '../ErrorPopup';
import FixImgOrientation from '../FixImgOrientation';
import './SingleFileUploader.scss';

export default class SingleFileUploader extends Component {
    constructor(props) {
        super(props);

        this.initialValues(props);
        let defaltPreviewObj = this.getFilePreviewObj(null, this.defaultTumbnail, Consts.DEFAULT_THUMBNAIL);

        this.state = {
            fileData: { previewObj: defaltPreviewObj, acceptedObj: null }
        };

        this.uploaderInputRef = React.createRef();
        this.onChange = this.onChange.bind(this); // Intentionally bind instead of arrow function
    }

    componentDidMount() {
        // In order to show the default chosen file, we "simulate" onChange function with the given file
        if (this.props.defaultChosenFile) {
            let file = this.props.defaultChosenFile;
            let e = { target: { files: [file] } };
            this.onChange(e, true, false);
        }
    }

    initialValues = (props) => {
        this.defaultTumbnail = this.getDefaultThumbnail();

        this.type = Consts.FILE_TYPES.includes(props.type) ?
            props.type : Consts.FILE_TYPE_IMAGE;

        this.height = this.props.height || "10em";

        this.thumbHeight = this.calcHeight(0.8, this.height);

        this.acceptedExtensions = this.getAcceptedExtensions();

        this.minSizeInKB = props.minSizeInKB && props.minSizeInKB > config.FILE_SIZE_RANGE_IN_KB[this.type].MIN_SIZE ?
            props.minSizeInKB : config.FILE_SIZE_RANGE_IN_KB[this.type].MIN_SIZE;

        this.maxSizeInKB = props.maxSizeInKB && props.maxSizeInKB < config.FILE_SIZE_RANGE_IN_KB[this.type].MAX_SIZE ?
            props.maxSizeInKB : config.FILE_SIZE_RANGE_IN_KB[this.type].MAX_SIZE;

        this.isErrorPopup = typeof this.props.isErrorPopup === "boolean" ? this.props.isErrorPopup : false; // default false 
    }

    calcHeight = (presentage, originalHeight) => {
        let uploaderHeight = originalHeight.match(/(\d||\.)+/)[0];
        let unit = originalHeight.split(uploaderHeight)[1];
        let newHeight = (Number(uploaderHeight) * presentage) + unit;
        return newHeight;
    }

    getDefaultThumbnail = () => {
        // Suppport previous versions
        let propsDefaultTumbnail = this.props.defaultValue || this.props.thumbnail || this.props.defaultThumbnailImageSrc;
        let defaultThumbnail = propsDefaultTumbnail || require(`../../../imgs/fileThumbnails/upload-file-thumbnail.svg`);
        return defaultThumbnail;
    }

    async onChange(e, fileSizeInRange = false, readFileToBase64 = true) {
        if (!e.target || !e.target.files || !e.target.files[0]) return;
        let file = e.target.files[0];

        let base64String = null;
        let fileObj = null;
        let filePreview = null;
        let showErrPopup = false;
        let [status, errMsg] = this.isFileInSizeRange(file, fileSizeInRange); // !NOTICE: When defaultChosenFile=true, the file is automatically accepted

        const extraFileObjProps = this.props.extraFileObjProps || {};
        if (config.SHRINK_LARGE_IMAGE_TO_MAX_SIZE || status === Consts.FILE_ACCEPTED) {

            if (!readFileToBase64) {
                if (file && file.file)
                    base64String = file.file;

                else base64String = file;
            }
            else {
                //if image => get base64 of image on canvas with orientation 1 
                if (this.props.type === Consts.FILE_TYPE_IMAGE) base64String = await FixImgOrientation.resetOrientation(file);
                //if audio/file => get base64 
                else base64String = await this.readFileToBase64(file);
            }
            if (this.props.type === Consts.FILE_TYPE_IMAGE && errMsg === Consts.ERROR_MSG_FILE_TOO_BIG) {
                //resize the image to smaller size and don't show the error message
                errMsg = null;
                status = Consts.FILE_ACCEPTED;
                base64String = await this.resizeLargeImage(file, base64String);
            }

            fileObj = {
                src: base64String,
                type: this.type,
                title: this.props.title || "default_title",
                category: this.props.category || "default_category",
                description: this.props.description || "default_description",
                ...extraFileObjProps
            };

            filePreview = this.getFilePreviewObj(file, base64String, status, errMsg, fileSizeInRange);
        }

        else { // status = Consts.FILE_REJECTED

            if (this.isErrorPopup) {
                filePreview = this.getFilePreviewObj(null, this.defaultTumbnail, status, errMsg);
                showErrPopup = true;
                this.uploaderInputRef.current.value = null;
            }
            else {
                if (this.type !== Consts.FILE_TYPE_FILE) {
                    if (!readFileToBase64) {
                        if (file && file.file) base64String = file.file;
                        else base64String = file;
                    }
                    else {
                        //if image => get base64 of image on canvas with orientation 1 
                        if (this.props.type === Consts.FILE_TYPE_IMAGE) {
                            base64String = await FixImgOrientation.resetOrientation(file)
                        }
                        //if audio/file => get base64 
                        else base64String = await this.readFileToBase64(file);
                    }
                }
                // --------
                filePreview = this.getFilePreviewObj(file, base64String, status, errMsg);
            }
        }

        let fileData = { previewObj: filePreview, acceptedObj: fileObj };

        // Display previews of dropped files and calls the onChange callback with the accepted files
        this.setState({ fileData, showErrPopup }, () => !fileSizeInRange && this.parentOnChange());
    }

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

    parentOnChange = () => {
        let errorMsg = this.state.fileData.previewObj && this.state.fileData.previewObj.status === Consts.FILE_REJECTED ?
            this.state.fileData.previewObj.errMsg : null;

        let eventObj = {
            target: {
                name: this.props.name || "singleFileUploader",
                value: this.state.fileData.acceptedObj || null
            },
            error: errorMsg
        };

        // Calls the onChange callback with the accepted file or the errMsg of a rejected file
        this.props.onChange && this.props.onChange !== "function" && this.props.onChange(eventObj);
    }

    isFileInSizeRange = (file, isDefaultChosenFile = false) => {
        let status = Consts.FILE_ACCEPTED;
        let errMsg = null;

        if (isDefaultChosenFile) return [status, errMsg];

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

    getFilePreviewObj = (file = null, base64String = null, status, errMsg = null, isDefaultChosenFile = false) => {
        let isDefaultPreview = status === Consts.DEFAULT_THUMBNAIL || (status === Consts.FILE_REJECTED && this.isErrorPopup);

        let filePreview = {
            preview: base64String,
            extension: null,
            status: status,
            errMsg: errMsg
        };

        if (isDefaultPreview) return filePreview;

        if (this.type === Consts.FILE_TYPE_FILE) {
            filePreview.preview = isDefaultChosenFile ? "Default file" : file.name;
            filePreview.extension = isDefaultChosenFile ? file.split(".").pop() : this.getExtension(file.type);
        }
        else filePreview.preview = base64String;

        return filePreview;
    }

    getFilePreviewHtml = (file, isDefaultPreview) => {
        let filePreview = null;
        let type = isDefaultPreview ? Consts.FILE_TYPE_IMAGE : this.type;

        switch (type) {
            case Consts.FILE_TYPE_FILE:
                filePreview =
                    <div ref={this.props.previewRef} style={{ height: this.thumbHeight }}>
                        <img src={require(`../../../imgs/fileThumbnails/${file.extension}-file-thumbnail.svg`)} alt={`uploading ${this.type}`} />
                        <h2 style={{ fontSize: this.calcHeight(0.15, this.thumbHeight) }}>{file.preview}</h2>
                    </div>;
                break;

            case Consts.FILE_TYPE_IMAGE:
                let style = { backgroundImage: `url(${file.preview})`, height: this.thumbHeight, width: this.thumbHeight };
                filePreview = <div ref={this.props.previewRef} className="chosen-img" style={style} />;
                break;

            case Consts.FILE_TYPE_VIDEO:
                filePreview = <video ref={this.props.previewRef} src={file.preview} type={"video/*"} style={{ height: this.thumbHeight }} />;
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
        this.uploaderInputRef.current.value = null;
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

    turnOffErrPopup = () => {
        this.setState({ showErrPopup: false });
    }

    render() {
        let file = this.state.fileData.previewObj;
        let isErrorPopup = file.status === Consts.FILE_REJECTED && this.isErrorPopup;
        let isDefaultPreview = file.status === Consts.DEFAULT_THUMBNAIL || isErrorPopup;
        let filePreviewHtml = this.getFilePreviewHtml(file, isDefaultPreview);
        let type = file.status === Consts.DEFAULT_THUMBNAIL ? Consts.FILE_TYPE_IMAGE : this.type;

        /* 
        Below code enables extending the component's return function without literly extending it.
        In case an uploader component (for example ImageUploader) needs to change SingleFileUploader component default props,
        such as type/theme/defaultThumbnailImageSrc etc, it can't be an extention of SingleFileUploader.
        Otherwise, when trying to change props obj before passing it to super(), an error accures:
        "...When calling super() make sure to pass up the same props that your component's constructor was passed".
        The solution is passing those props in the uploader component's render and using the following "hook"
        */
        let vars = { file, isErrorPopup, isDefaultPreview, filePreviewHtml, type };
        let extraVars = this.props.getExtraVars && typeof this.props.getExtraVars === "function" ?
            this.props.getExtraVars(vars, this) : {};
        vars = { ...vars, ...extraVars };

        if (this.props.replaceReturn && typeof this.props.replaceReturn === "function")
            return this.props.replaceReturn(vars, this);

        return (
            <div className="single-file-uploader" style={{ height: this.height }}>
                <div className={this.props.theme || "basic-theme"}>
                    <input
                        id={this.props.name}
                        name={this.type}
                        type="file"
                        onChange={this.onChange}
                        disabled={this.props.disabled}
                        required={this.props.required || false}
                        accept={this.acceptedExtensions}
                        ref={this.uploaderInputRef} />

                    {this.props.theme === "button-theme" &&
                        <label htmlFor={this.props.name}>
                            <FontAwesomeIcon icon={"upload"} />
                            <div className="label">{this.props.label || `Load ${this.type}`}</div>
                        </label>}

                    <div className={`single-file-preview ${type}-preview`}>

                        {this.props.theme !== "button-theme" &&
                            <label htmlFor={this.props.name}>
                                {filePreviewHtml}
                                <div className="label" style={{ fontSize: this.calcHeight(0.125, this.thumbHeight) }}>
                                    {this.props.label || `Load ${this.type}`}
                                </div>
                            </label>}

                        {this.props.theme === "button-theme" && !isDefaultPreview &&
                            filePreviewHtml}

                        {// Add remove button
                            !this.props.disabled && !isDefaultPreview &&
                            <div className="remove-icon" onClick={this.removeFile}>
                                <img src={this.props.removeFileIcon || require('../../../imgs/x-icon.png')} alt="x" style={{ height: this.calcHeight(0.25, this.thumbHeight) }} />
                            </div>}

                        {// Add error icon if needed
                            file.status === Consts.FILE_REJECTED && !isDefaultPreview &&
                            <div className="error-icon">
                                <Tooltip title={file.errMsg} placement="left" className="tool-tip">
                                    <img src={require('../../../imgs/error.svg')} alt={file.errMsg} style={{ height: this.calcHeight(0.25, this.thumbHeight) }} />
                                </Tooltip>
                            </div>}
                    </div>

                    {isErrorPopup && typeof this.state.showErrPopup === "boolean" &&
                        <ErrorPopup
                            message={file.errMsg}
                            showPopup={this.state.showErrPopup}
                            toggleShowPopup={this.turnOffErrPopup} />}
                </div>
            </div>
        )
    }
}