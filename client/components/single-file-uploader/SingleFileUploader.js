import React, { Component, useState, useEffect, useRef } from 'react';
import SingleFileUploaderClass from './SingleFileUploaderClass';
import Consts from '../../../consts/Consts.json';
import ErrorPopup from '../ErrorPopup';
import Tooltip from '@material-ui/core/Tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './SingleFileUploader.scss';

// const useSingleton = (cb = () => { }) => {
//     const [hasBeenCalled, setHasBeenCalled] = useState(false);
//     if (hasBeenCalled) return;
//     cb();
//     setHasBeenCalled(true);
// }

// export default function SingleFileUploader(props) {
//     const defaults = useRef({}).current;
//     const uploaderInputRef = useRef(null);

//     useSingleton(() => { // TODO: Create useEffect
//         // This only happens ONCE and it happens BEFORE the initial render
//         defaults.isErrorPopup = typeof props.isErrorPopup === "boolean" ?
//             props.isErrorPopup : false; // default false;

//         let { onChange, ...restProps } = props;
//         let updateProps = {
//             ...restProps,
//             parentOnChange: onChange,
//             isErrorPopup: defaults.isErrorPopup
//         };

//         defaults.uploader = new SingleFileUploaderClass(updateProps); // TODO: Convert to react Hooks
//         defaults.defaltPreviewObj = defaults.uploader.getFilePreviewObj(null, defaults.uploader.defaultTumbnail, Consts.DEFAULT_THUMBNAIL);
//         defaults.acceptedExtensions = getAcceptedExtensions();
//         defaults.height = props.height || "10em";
//         defaults.thumbHeight = calcHeight(0.8, defaults.height);
//     });

//     const [fileData, setFileData] = useState({ previewObj: defaults.defaltPreviewObj, acceptedObj: null });
//     const [showErrPopup, setShowErrPopup] = useState(null);

//     useEffect(() => {
//         // In order to show the default chosen file, we "simulate" onChange function with the given file
//         if (props.defaultChosenFile) {
//             let file = props.defaultChosenFile;
//             let e = { target: { files: [file] } };
//             defaults.uploader.onChange(e, true, false);
//         }
//     }, []);

//     useEffect(() => {
//         if (!isDefaultChosenFile) this.parentOnChange();
//      }, [fileData]); 

//     onChange = (fileData, isDefaultChosenFile = false) => {
//         let extraState = {};

//         // Display previews of dropped files and calls the onChange callback with the accepted files
//         if (fileData.previewObj.status === Consts.FILE_REJECTED) {
//             if (defaults.isErrorPopup) {
//                 uploaderInputRef.current.value = null;
//                 extraState.showErrPopup = true;
//             }
//         }
//         this.setState({ fileData, ...extraState },
//             () => {
//                 if (!isDefaultChosenFile) this.parentOnChange();
//             });
//     }

//     return (
//         <div>
//             roni
//         </div>
//     );
// }


export default class SingleFileUploader extends Component {

    constructor(props) {
        super(props);

        this.isErrorPopup = typeof this.props.isErrorPopup === "boolean" ? this.props.isErrorPopup : false; // default false 

        let { onChange, ...restProps } = props;
        let updateProps = {
            ...restProps,
            parentOnChange: this.onChange,
            isErrorPopup: this.isErrorPopup
        };
        this.uploader = new SingleFileUploaderClass(updateProps); // TODO: Convert to react Hooks
        let defaltPreviewObj = this.uploader.getFilePreviewObj(null, this.uploader.defaultTumbnail, Consts.DEFAULT_THUMBNAIL);

        this.state = {
            fileData: { previewObj: defaltPreviewObj, acceptedObj: null },
            showErrPopup: null
        }

        this.acceptedExtensions = this.getAcceptedExtensions();
        this.height = this.props.height || "10em";
        this.thumbHeight = this.calcHeight(0.8, this.height);

        /* The following properties should be called from uploader:
        - defaultTumbnail
        - type */
        this.uploaderInputRef = React.createRef();
    }

    componentDidMount() {
        // In order to show the default chosen file, we "simulate" onChange function with the given file
        if (this.props.defaultChosenFile) {
            let file = this.props.defaultChosenFile;
            let e = { target: { files: [file] } };
            this.uploader.onChange(e, true, false);
        }
    }

    onChange = (fileData, isDefaultChosenFile = false) => {
        let extraState = {};

        // Display previews of dropped files and calls the onChange callback with the accepted files
        if (fileData.previewObj.status === Consts.FILE_REJECTED) {
            if (this.isErrorPopup) {
                this.uploaderInputRef.current.value = null;
                extraState.showErrPopup = true;
            }
        }
        this.setState({ fileData, ...extraState },
            () => {
                if (!isDefaultChosenFile) this.parentOnChange();
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
                        <img src={require(`../../../imgs/fileThumbnails/${file.extension}-file-thumbnail.svg`)} alt={`uploading ${this.uploader.type}`} />
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
        let defaltPreviewObj = this.uploader.getFilePreviewObj(null, this.uploader.defaultTumbnail, Consts.DEFAULT_THUMBNAIL);
        this.uploader.fileData = { previewObj: defaltPreviewObj, acceptedObj: null };
        let fileData = { previewObj: defaltPreviewObj, acceptedObj: null };
        this.onChange(fileData);
    }

    turnOffErrPopup = () => {
        this.setState({ showErrPopup: false });
    }

    render() {
        let file = this.state.fileData.previewObj;
        let isErrorPopup = file.status === Consts.FILE_REJECTED && this.isErrorPopup;
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

                        {this.props.theme === "button-theme" && !isDefaultPreview && // TODO: Remove button-theme
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