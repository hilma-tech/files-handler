import React, { Component } from 'react';
import SingleFileUploaderClass from './single-file-uploader/SingleFileUploaderClass';
import Consts from '../../consts/Consts.json';
import ErrorPopup from '../components/ErrorPopup';
import Tooltip from '@material-ui/core/Tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './single-file-uploader/SingleFileUploader.scss';

export default class FileUploader extends Component { // SingleFileUploaderComp

    constructor(props) {
        super(props);

        let { onChange, ...restProps } = props;
        let updateProps = {
            ...restProps,
            type: Consts.FILE_TYPE_FILE,
            onUploaderChange: this.onUploaderChange
        };
        this.uploader = new SingleFileUploaderClass(updateProps); // TODO: Convert to react Hooks
        let defaltPreviewObj = this.uploader.getFilePreviewObj(null, this.uploader.defaultTumbnail, Consts.DEFAULT_THUMBNAIL);

        this.state = {
            fileData: { previewObj: defaltPreviewObj, acceptedObj: null },
            showErrPopup: false
        }

        /* This unique:
        - defaultTumbnail
        - type
        - isErrorPopup */
        this.uploaderInputRef = React.createRef();

        this.height = this.props.height || "10em";
        this.thumbHeight = this.calcHeight(0.8, this.height);
        this.acceptedExtensions = this.getAcceptedExtensions();
    }

    componentDidMount() {
        // In order to show the default chosen file, we "simulate" onChange function with the given file
        if (this.props.defaultChosenFile) {
            let file = this.props.defaultChosenFile;
            let e = { target: { files: [file] } };
            this.onChange(e, true, false);
        }
    }

    onUploaderChange = (fileData, fileSizeInRange) => {
        // Display previews of dropped files and calls the onChange callback with the accepted files
        this.setState({ fileData }, () => !fileSizeInRange && this.parentOnChange()); // TODO: Handle showErrPopup
    }

    parentOnChange = () => { // TODO: Unite funcs
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

    calcHeight = (presentage, originalHeight) => {
        let uploaderHeight = originalHeight.match(/(\d||\.)+/)[0];
        let unit = originalHeight.split(uploaderHeight)[1];
        let newHeight = (Number(uploaderHeight) * presentage) + unit;
        return newHeight;
    }

    getAcceptedExtensions = () => {
        let accept = Consts.FILE_EXTENSIONS[this.uploader.type];
        accept = "." + accept.join(", .");
        return accept;
    }

    getFilePreviewHtml = (file, isDefaultPreview) => {
        let filePreview = null;
        let type = isDefaultPreview ? Consts.FILE_TYPE_IMAGE : this.uploader.type;

        switch (type) {
            case Consts.FILE_TYPE_FILE:
                filePreview =
                    <div ref={this.props.previewRef} style={{ height: this.thumbHeight }}>
                        <img src={require(`../../imgs/fileThumbnails/${file.extension}-file-thumbnail.svg`)} alt={`uploading ${this.uploader.type}`} />
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

    removeFile = () => { // TODO: uploader doesn't know about the change
        if (this.state.fileData.previewObj.state === Consts.DEFAULT_THUMBNAIL) return;
        this.uploaderInputRef.current.value = null;
        let defaltPreviewObj = this.uploader.getFilePreviewObj(null, this.defaultTumbnail, Consts.DEFAULT_THUMBNAIL);
        let fileData = { previewObj: defaltPreviewObj, acceptedObj: null };
        this.setState({ fileData }, this.parentOnChange);
    }

    turnOffErrPopup = () => {
        this.setState({ showErrPopup: false });
    }

    render() { // TODO: Belongs to SingleFileUploaderComp
        console.log("this.state", this.state)
        let file = this.state.fileData.previewObj;
        let isErrorPopup = file.status === Consts.FILE_REJECTED && this.uploader.isErrorPopup;
        let isDefaultPreview = file.status === Consts.DEFAULT_THUMBNAIL || isErrorPopup;
        let filePreviewHtml = this.getFilePreviewHtml(file, isDefaultPreview);
        let type = file.status === Consts.DEFAULT_THUMBNAIL ? Consts.FILE_TYPE_IMAGE : this.uploader.type;

        return (
            <div className="single-file-uploader" style={{ height: this.height }}>
                <div className={this.props.theme || "basic-theme"}>
                    <input
                        id={this.props.name}
                        name={this.uploader.type}
                        type="file"
                        onChange={this.uploader.onChange}
                        disabled={this.props.disabled}
                        required={this.props.required || false}
                        accept={this.acceptedExtensions}
                        ref={this.uploaderInputRef} />

                    {this.props.theme === "button-theme" &&
                        <label htmlFor={this.props.name}>
                            <FontAwesomeIcon icon={"upload"} />
                            <div className="label">{this.props.label || `Load ${this.uploader.type}`}</div>
                        </label>}

                    <div className={`single-file-preview ${type}-preview`}>

                        {this.props.theme !== "button-theme" &&
                            <label htmlFor={this.props.name}>
                                {filePreviewHtml}
                                <div className="label" style={{ fontSize: this.calcHeight(0.125, this.thumbHeight) }}>
                                    {this.props.label || `Load ${this.uploader.type}`}
                                </div>
                            </label>}

                        {this.props.theme === "button-theme" && !isDefaultPreview &&
                            filePreviewHtml}

                        {// Add remove button
                            !this.props.disabled && !isDefaultPreview &&
                            <div className="remove-icon" onClick={this.removeFile}>
                                <img src={this.props.removeFileIcon || require('../../imgs/x-icon.png')} alt="x" style={{ height: this.calcHeight(0.25, this.thumbHeight) }} />
                            </div>}

                        {// Add error icon if needed
                            file.status === Consts.FILE_REJECTED && !isDefaultPreview &&
                            <div className="error-icon">
                                <Tooltip title={file.errMsg} placement="left" className="tool-tip">
                                    <img src={require('../../imgs/error.svg')} alt={file.errMsg} style={{ height: this.calcHeight(0.25, this.thumbHeight) }} />
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