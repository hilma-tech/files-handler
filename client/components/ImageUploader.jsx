import React, { Component } from 'react';
import SingleFileUploader from './single-file-uploader/SingleFileUploader';
import ImageDataHandler from './uploadres/file-uploader/FileDataHandler';
import Consts from '../../consts/Consts.json';
import Tooltip from '@material-ui/core/Tooltip';
import ErrorPopup from './ErrorPopup';
import CropPopup from "./ImageCropper";
import './ImageUploader.scss';

// export default function ImageUploader(props) {
//     return (
//         <>
//             <SingleFileUploader
//                 type={Consts.FILE_TYPE_IMAGE}
//                 wrapper={ImageDataHandler}
//                 {...props}
//             />
//         </>
//     );
// }

// Change to functional component
export default class ImageUploader extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showPreviewPopup: null,
            crop: false
        };
    }

    togglePreviewPopup = () => {
        this.setState({ showPreviewPopup: !this.state.showPreviewPopup });
    }

    addExtraProps = (Component, extraProps) => {
        return <Component.type {...Component.props} {...extraProps} />;
    }

    updateProps = () => {
        let props = { ...this.props };

        props.type = Consts.FILE_TYPE_IMAGE;

        let propsDefaultTumbnail = props.defaultValue || props.thumbnail || props.defaultThumbnailImageSrc;
        let defaultThumbnail = propsDefaultTumbnail || (props.theme === "circle-theme" ?
            require(`../../imgs/circle-theme-default-thumbnail.svg`) :
            require(`../../imgs/default-thumbnail.svg`));
        props.defaultThumbnailImageSrc = defaultThumbnail;

        props.extraFileObjProps = {
            isMultiSizes: props.isMultiSizes || false
        };

        return props;
    }

    getExtraVars = (vars, pThis) => { // pThis = parent this
        let previewWidgetChosenImg = this.props.previewWidget ? <div className="chosen-img-preview" style={{ backgroundImage: `url(${vars.file.preview})` }} /> : null;
        let filePreviewHtml = this.addExtraProps(pThis.getFilePreviewHtml(vars.file, vars.isDefaultPreview), { onClick: this.props.previewWidget && this.togglePreviewPopup });
        return { previewWidgetChosenImg, filePreviewHtml };
    }

    replaceReturn = (vars, pThis) => {
        let labelStyle = pThis.props.theme === "circle-theme" ? {
            width: pThis.thumbHeight,
            height: pThis.calcHeight(0.5, pThis.thumbHeight),
            fontSize: pThis.calcHeight(0.125, pThis.thumbHeight)
        } : { fontSize: pThis.calcHeight(0.125, pThis.thumbHeight) };
        let style = this.props.style ? this.props.style : { height: pThis.thumbHeight, width: pThis.thumbHeight }
        // Supports previous versions (AKA default-theme)
        if (!pThis.props.theme && !pThis.props.previewWidget)
            return (
                <div className="image-uploader-container single-file-uploader">
                    <div className="default-theme single-file-preview">

                        {// Add remove button
                            !pThis.props.previewWidget && !pThis.props.disabled && !vars.isDefaultPreview &&
                            <div className="remove-icon" onClick={pThis.removeFile}>
                                {pThis.props.removeFileIcon || 'x'}
                            </div>}

                        <label>
                            <input
                                className="default-theme-input"
                                name={pThis.type}
                                type="file"
                                onChange={pThis.onChange}
                                disabled={pThis.props.disabled || false}
                                required={pThis.props.required || false}
                                accept={pThis.acceptedExtensions}
                                ref={pThis.uploaderInputRef}
                            />
                            <img
                                className="default-theme-image"
                                ref={pThis.props.previewRef}
                                src={vars.file.preview}
                                alt={`uploading ${pThis.type}`}
                                onError={() => {
                                    let defaltPreviewObj = pThis.getFilePreviewObj(null, pThis.defaultTumbnail, Consts.DEFAULT_THUMBNAIL);
                                    let fileData = { previewObj: defaltPreviewObj, acceptedObj: null };
                                    pThis.setState({ fileData });
                                }}
                                style={style}
                            />
                            <div className="default-theme-label">{pThis.props.label || "Defalt-theme is not recommended and will be deprecated"}</div>
                        </label>

                        {vars.isErrorPopup && typeof pThis.state.showErrPopup === "boolean" &&
                            <ErrorPopup
                                message={vars.file.errMsg}
                                showPopup={pThis.state.showErrPopup}
                                toggleShowPopup={pThis.turnOffErrPopup} />}
                    </div>
                </div>
            );
        return (
            <div className="image-uploader-container single-file-uploader">
                <div className={pThis.props.theme}>
                    <input
                        id={pThis.props.name}
                        name={pThis.type}
                        type="file"
                        onChange={pThis.onChange}
                        disabled={pThis.props.disabled}
                        required={pThis.props.required || false}
                        accept={pThis.acceptedExtensions}
                        ref={pThis.uploaderInputRef}
                    />

                    <div className={`${pThis.props.previewWidget && 'chosen-image-parent'} single-file-preview ${vars.type}-preview`}>

                        {!pThis.props.previewWidget ?
                            <label htmlFor={pThis.props.name}>
                                {vars.filePreviewHtml}

                                <div className="label" style={labelStyle}>
                                    {pThis.props.label || `Load ${pThis.type}`}
                                </div>
                            </label> : vars.filePreviewHtml}

                        {// Add remove button
                            !pThis.props.previewWidget && !pThis.props.disabled && !vars.isDefaultPreview &&
                            <div className="remove-icon" onClick={pThis.removeFile}>
                                <img src={pThis.props.removeFileIcon || require('../../imgs/x-icon.png')} alt="x" style={{ height: pThis.calcHeight(0.25, pThis.thumbHeight) }} />
                            </div>}

                        {// Add error icon if needed
                            vars.file.status === Consts.FILE_REJECTED && !vars.isDefaultPreview &&
                            <div className="error-icon">
                                <Tooltip title={vars.file.errMsg} placement="left" className="tool-tip">
                                    <img src={require('../../imgs/error.svg')} alt={vars.file.errMsg} style={{ height: pThis.calcHeight(0.25, pThis.thumbHeight) }} />
                                </Tooltip>
                            </div>}
                    </div>

                    {vars.isErrorPopup && typeof pThis.state.showErrPopup === "boolean" &&
                        <ErrorPopup
                            message={vars.file.errMsg}
                            showPopup={pThis.state.showErrPopup}
                            toggleShowPopup={pThis.turnOffErrPopup} />}

                    {pThis.props.previewWidget && typeof this.state.showPreviewPopup === "boolean" &&
                        this.addExtraProps(pThis.props.previewWidget, {
                            chosenImg: vars.previewWidgetChosenImg,
                            showPopup: this.state.showPreviewPopup,
                            toggleShowPopup: this.togglePreviewPopup,
                            removeFile: pThis.removeFile,
                            inputId: pThis.props.name,
                            disabled: pThis.props.disabled,
                            src: (pThis.props.previewWidget.props.crop && !vars.isDefaultPreview &&
                                pThis.state.fileData.previewObj.errMsg !== Consts.ERROR_MSG_FILE_TOO_SMALL
                                && pThis.state.fileData.previewObj.preview),
                            onChange: pThis.onChange
                        })}

                </div>
                {/* display crop option */}
                {this.props.crop && //if we want to enable crop
                    !vars.isDefaultPreview &&//and this isn't the default image
                    pThis.state.fileData.previewObj.errMsg !== Consts.ERROR_MSG_FILE_TOO_SMALL &&//and image is  not to small
                    <div>
                        <button onClick={() => this.setState({ crop: true })}>{this.props.crop.texts.cropButtonName || "crop"}</button>

                        {this.state.crop && <CropPopup
                            onChange={pThis.onChange}
                            onClose={() => this.setState({ crop: false })}
                            src={pThis.state.fileData.previewObj.preview}
                            {...this.props.crop}
                        />}
                    </div>}
            </div>
        )
    }

    /*
    Below code enables extending the SingleFileUploader's return function without literly extending it.
    We needs to change SingleFileUploader component default props,
    such as type/theme/defaultThumbnailImageSrc etc, so it can't be an extention of SingleFileUploader.
    Otherwise, when trying to change props obj before passing it to super(), an error accures:
    "...When calling super() make sure to pass up the same props that your component's constructor was passed".
    The solution is using getExtraVars and replaceReturn props.
    */
    render() {
        return (
            <>
                <SingleFileUploader
                    {...this.updateProps()}
                    getExtraVars={this.getExtraVars}
                    replaceReturn={this.replaceReturn}
                />
            </>
        );
    }
}