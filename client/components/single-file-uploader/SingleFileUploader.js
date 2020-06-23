import React, { Component } from 'react';
import SingleFileUploaderClass from './SingleFileUploaderClass';
import Consts from '../../../consts/Consts.json';
import ErrorPopup from '../ErrorPopup';
import Tooltip from '@material-ui/core/Tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './SingleFileUploader.scss';

export default class SingleFileUploader extends Component {

    constructor(props) {
        super(props);

        this.state = { showErrPopup: null };

        this.initialValues(props);

        this.uploaderInputRef = React.createRef();
    }

    initialValues = (props) => {
        this.type = Consts.FILE_TYPES.includes(this.props.type) ?
            this.props.type : Consts.FILE_TYPE_IMAGE;

        this.isErrorPopup = typeof this.props.isErrorPopup === "boolean" ?
            this.props.isErrorPopup : false; // default false

        this.acceptedExtensions = this.getAcceptedExtensions();
        this.height = this.props.height || "10em";
        this.thumbHeight = this.calcHeight(0.8, this.height);

        let { onChange, ...restProps } = props;
        this.uploaderProps = {
            ...restProps,
            type: this.type,
            isErrorPopup: this.isErrorPopup
        };
    }

    onChange = (fileData, isDefaultChosenFile = false) => {
        // Display previews of dropped files and calls the onChange callback with the accepted files
        if (fileData.previewObj.status === Consts.FILE_REJECTED) {
            if (this.isErrorPopup) {
                this.uploaderInputRef.current.value = null;
                this.setState({ showErrPopup: true });
            }
        }
        if (!isDefaultChosenFile) this.parentOnChange(fileData);
    }

    parentOnChange = (fileData) => {
        let errorMsg = fileData.previewObj && fileData.previewObj.status === Consts.FILE_REJECTED ?
            fileData.previewObj.errMsg : null;

        let eventObj = {
            target: {
                name: this.props.name || "singleFileUploader",
                value: fileData.acceptedObj || null
            },
            error: errorMsg
        };

        // Calls the onChange callback with the accepted file or the errMsg of a rejected file
        this.props.onChange && this.props.onChange !== "function" && this.props.onChange(eventObj);
    }

    removeFile = () => {
        this.uploaderInputRef.current.value = null;
    }

    calcHeight = (presentage, originalHeight) => {
        let uploaderHeight = originalHeight.match(/(\d||\.)+/)[0];
        let unit = originalHeight.split(uploaderHeight)[1];
        let newHeight = (Number(uploaderHeight) * presentage) + unit;
        return newHeight;
    }

    getAcceptedExtensions = () => {
        let accept = Consts.FILE_EXTENSIONS[this.type];
        accept = "." + accept.join(", .");
        return accept;
    }

    getFilePreviewHtml = (file, isDefaultPreview) => { // TODO: Enable more flexibility
        let filePreview = null;
        let type = isDefaultPreview ? Consts.FILE_TYPE_IMAGE : this.type;

        switch (type) {
            case Consts.FILE_TYPE_FILE:
                filePreview =
                    <div
                        ref={this.props.previewRef}
                        style={{ height: this.thumbHeight }}>
                        <img
                            src={require(`../../../imgs/fileThumbnails/${file.extension}-file-thumbnail.svg`)}
                            alt={`uploading ${this.type}`} />
                        <h2 style={{ fontSize: this.calcHeight(0.15, this.thumbHeight) }}>{file.preview}</h2>
                    </div>;
                break;

            case Consts.FILE_TYPE_IMAGE:
                let style = { backgroundImage: `url(${file.preview})`, height: this.thumbHeight, width: this.thumbHeight };
                filePreview = <div
                    ref={this.props.previewRef}
                    className="chosen-img"
                    style={style} />;
                break;

            case Consts.FILE_TYPE_VIDEO:
                filePreview = <video
                    ref={this.props.previewRef}
                    src={file.preview}
                    type={"video/*"}
                    style={{ height: this.thumbHeight }} />;
                break;

            case Consts.FILE_TYPE_AUDIO:
                filePreview = <audio
                    ref={this.props.previewRef}
                    controls src={file.preview}
                    type={"audio/*"} />;
                break;

            default: break;
        }

        return (
            <div className={`thumb ${type}-thumb`}>
                {filePreview}
            </div>
        )
    }

    turnOffErrPopup = () => {
        this.setState({ showErrPopup: false });
    }

    render() { // TODO: Devide to sub components
        return (
            <SingleFileUploaderClass {...this.uploaderProps}>
                {({ fileData, onChange, removeFile }) => {
                    let file = fileData.previewObj;
                    let isErrorPopup = file.status === Consts.FILE_REJECTED && this.isErrorPopup;
                    let isDefaultPreview = file.status === Consts.DEFAULT_THUMBNAIL || isErrorPopup;
                    let filePreviewHtml = this.getFilePreviewHtml(file, isDefaultPreview);
                    let currType = file.status === Consts.DEFAULT_THUMBNAIL ? Consts.FILE_TYPE_IMAGE : this.type;

                    return (
                        <div className="single-file-uploader" style={{ height: this.height }}>
                            <div className={this.props.theme || "basic-theme"}>
                                <input
                                    id={this.props.name}
                                    name={this.type}
                                    type="file"
                                    onChange={(e) => onChange(e, false, true, this.onChange)}
                                    disabled={this.props.disabled}
                                    required={this.props.required || false}
                                    accept={this.acceptedExtensions}
                                    ref={this.uploaderInputRef}
                                />

                                {this.props.theme === "button-theme" &&
                                    <label htmlFor={this.props.name}>
                                        <FontAwesomeIcon icon={"upload"} />
                                        <div className="label">{this.props.label || `Load ${this.type}`}</div>
                                    </label>}

                                <div className={`single-file-preview ${currType}-preview`}>

                                    {this.props.theme !== "button-theme" &&
                                        <label htmlFor={this.props.name}>
                                            {filePreviewHtml}
                                            <div className="label" style={{ fontSize: this.calcHeight(0.125, this.thumbHeight) }}>
                                                {this.props.label || `Load ${this.type}`}
                                            </div>
                                        </label>}

                                    {this.props.theme === "button-theme" && !isDefaultPreview && // TODO: Remove button-theme
                                        filePreviewHtml}

                                    {// Add remove button
                                        !this.props.disabled && !isDefaultPreview &&
                                        <div className="remove-icon" onClick={() => removeFile(this.removeFile)}>
                                            <img
                                                src={this.props.removeFileIcon || require('../../../imgs/x-icon.png')}
                                                alt="x"
                                                style={{ height: this.calcHeight(0.25, this.thumbHeight) }} />
                                        </div>}

                                    {// Add error icon if needed
                                        file.status === Consts.FILE_REJECTED && !isDefaultPreview &&
                                        <div className="error-icon">
                                            <Tooltip title={file.errMsg} placement="left" className="tool-tip">
                                                <img
                                                    src={require('../../../imgs/error.svg')}
                                                    alt={file.errMsg}
                                                    style={{ height: this.calcHeight(0.25, this.thumbHeight) }} />
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
                    );
                }}
            </SingleFileUploaderClass>
        )
    }
}