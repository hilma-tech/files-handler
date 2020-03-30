import React from 'react';
import SingleFileUploader from './single-file-uploader/SingleFileUploader';
import Consts from '../../consts/Consts.json';
import Tooltip from '@material-ui/core/Tooltip';
import './ImageUploader.scss';

export default class ImageUploader extends SingleFileUploader {

    constructor(props) {
        props = { ...props };
        props.type = Consts.FILE_TYPE_IMAGE;
        let propsDefaultTumbnail = props.defaultValue || props.thumbnail || props.defaultThumbnailImageSrc;
        let defaultThumbnail = propsDefaultTumbnail ||
            (props.theme === "circle-theme" ?
                require(`../../imgs/circle-theme-default-thumbnail.svg`) :
                require(`../../imgs/default-thumbnail.svg`));
        props.defaultThumbnailImageSrc = defaultThumbnail;

        super(props);
    }

    toggleShowPopup = () => {
        this.setState({ showPopup: !this.state.showPopup });
    }

    addExtraProps = (Component, extraProps) => {
        return <Component.type {...Component.props} {...extraProps} />;
    }

    render() {
        let file = this.state.fileData.previewObj;
        let filePreviewHtml = this.addExtraProps(this.getFilePreviewHtml(file), {onClick: this.props.previewWidget && this.toggleShowPopup});
        let type = file.status === Consts.DEFAULT_THUMBNAIL ? Consts.FILE_TYPE_IMAGE : this.type;
        let previewWidgetChosenImg = this.props.previewWidget ? <div className="chosen-img-preview" style={{ backgroundImage: `url(${file.preview})` }} /> : null;

        // Supports previous versions (AKA default-theme)
        if (!this.props.theme && !this.props.previewWidget)
            return (
                <div>
                    {(file.status !== Consts.DEFAULT_THUMBNAIL) &&
                        <div onClick={this.removeFile}>{this.props.removeFileIcon || 'x'}</div>}
                    <label>
                        <input
                            name={this.type}
                            type="file"
                            onChange={this.onChange}
                            disabled={this.props.disabled || false}
                            required={this.props.required || false}
                            accept={this.acceptedExtensions}
                            ref="uploaderInputRef"
                        />
                        <img
                            src={file.preview}
                            alt={`uploading ${this.type}`}
                            onError={() => {
                                let defaltPreviewObj = this.getFilePreviewObj(null, this.defaultTumbnail, Consts.DEFAULT_THUMBNAIL);
                                let fileData = { previewObj: defaltPreviewObj, acceptedObj: null };
                                this.setState({ fileData });
                            }}
                        />
                        <div>{this.props.label || `Choose ${this.type}`}</div>
                    </label>
                </div>
            );

        return (
            <div className="image-uploader-container">
                <div className={this.props.theme}>
                    <input
                        id={this.props.name}
                        name={this.type}
                        type="file"
                        onChange={this.onChange}
                        disabled={this.props.disabled}
                        required={this.props.required || false}
                        accept={this.acceptedExtensions}
                        ref="uploaderInputRef" />

                    {this.props.previewWidget ?
                        filePreviewHtml :

                        <div className={`chosen-image-parent ${type}-preview`}>
                            <label htmlFor={this.props.name}>
                                {filePreviewHtml}
                                <div className="label">{this.props.label || `Choose ${this.type}`}</div>
                            </label>

                            {// Add remove button
                                !this.props.disabled && file.status !== Consts.DEFAULT_THUMBNAIL &&
                                <div className="remove-icon" onClick={this.removeFile}>
                                    <img src={this.props.removeFileIcon || require('../../imgs/x-icon.png')} alt="x" />
                                </div>}

                            {// Add error icon if needed
                                file.status === Consts.FILE_REJECTED &&
                                <div className="error-icon">
                                    <Tooltip title={file.errMsg} placement="left" classes="tool-tip">
                                        <img src={require('../../imgs/error.svg')} alt={file.errMsg} />
                                    </Tooltip>
                                </div>}
                        </div>}

                    {this.props.previewWidget &&
                        typeof this.state.showPopup === "boolean" &&
                        this.addExtraProps(this.props.previewWidget, {
                            chosenImg: previewWidgetChosenImg,
                            showPopup: this.state.showPopup,
                            toggleShowPopup: this.toggleShowPopup,
                            removeFile: this.removeFile,
                            inputId: this.props.name,
                            disabled: this.props.disabled
                        })}
                </div>
            </div>
        )
    }
}