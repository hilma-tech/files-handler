import React, { Component } from 'react';
import './ImageUploader.scss';

export default class ImageUploader extends Component {

    constructor(props) {
        super(props);

        this.defaultThumbnail = this.props.theme === "circle-theme" ? require(`./../../imgs/circle-theme-default-thumbnail.svg`)
            : require(`./../../imgs/default-thumbnail.svg`);

        this.state = {
            thumbnail: this.props.defaultValue || this.props.thumbnail || this.props.defaultThumbnailImageSrc || this.defaultThumbnail,
        };
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

    removeFile = () => {
        if (this.state.thumbnail === (this.props.thumbnail || this.defaultThumbnail)) return;
        this.refs.imageUploaderInputRef.value = null;
        this.setState({ thumbnail: this.props.thumbnail || this.defaultThumbnail });
        let eventObj = { target: { name: this.props.name, value: null } }
        this.props.onChange(eventObj);
    }

    onChangeImg = async (e) => {
        // console.log("Image has changed");
        let base64String = await this.readFileToBase64(e.target.files[0]);
        this.setState({ thumbnail: base64String })

        let imageObj = {
            src: base64String,
            type: 'image',
            title: this.props.title || "default_image_title",
            category: this.props.category || "default_image_category",
            description: this.props.description || "default_image_description"
        };

        let eventObj = { target: { name: this.props.name, value: imageObj } }
        this.props.onChange(eventObj);
    }

    toggleShowPopup = () => {
        this.setState({ showPopup: !this.state.showPopup });
    }

    addExtraProps = (Component, extraProps) => {
        return <Component.type {...Component.props} {...extraProps} />;
    }

    render() {

        let chosenImgStyle = { backgroundImage: `url(${this.state.thumbnail}), url(${this.props.thumbnail || this.defaultThumbnail})` }  //other url is in case the first is failed to load
        let chosenImg = <div className="chosen-img" style={chosenImgStyle} onClick={this.props.previewWidget && this.toggleShowPopup} />;
        let previewWidgetChosenImg = <div className="chosen-img" style={chosenImgStyle} />;

        return (
            <div dir="ltr" className="image-uploader-container">
                <div className={this.props.theme ? this.props.theme : "default-theme"}>

                    <input
                        id="image-uploader"
                        onChange={this.onChangeImg}
                        name="image"
                        required={this.props.required || false}
                        type="file"
                        accept=".png, .jpg, .jpeg, .gif, .svg"
                        ref="imageUploaderInputRef" />

                    {this.props.previewWidget ?
                        chosenImg :
                        <div className="chosen-image-parent">
                            <label htmlFor="image-uploader">
                                {chosenImg}
                                <div className="label">{this.props.label || "Choose image"}</div>
                            </label>

                            {(this.state.thumbnail !== this.props.thumbnail)
                                && (this.state.thumbnail !== this.defaultThumbnail)
                                && (this.state.thumbnail !== this.props.defaultThumbnailImageSrc) &&

                                <div onClick={this.removeFile}>
                                    {this.props.removeFileIcon ||
                                        <img className="remove-button" src={require('../../imgs/x-icon.png')} alt="x" />}
                                </div>}
                        </div>}
                </div>

                {this.props.previewWidget &&
                    typeof this.state.showPopup === "boolean" &&
                    this.addExtraProps(this.props.previewWidget, {
                        chosenImg: previewWidgetChosenImg,
                        showPopup: this.state.showPopup,
                        toggleShowPopup: this.toggleShowPopup,
                        removeFile: this.removeFile
                    })}
            </div>
        );
    }
}

export class PreviewWidget extends Component {

    constructor(props) {
        super(props);

        this.state = {
            showPopup: this.props.showPopup
        };
    }

    render() {
        return (
            <div className="preview-widget">
                {this.props.showPopup && <div className="dark-background" onClick={this.props.toggleShowPopup} />}
                <div className={`image-popup ${this.props.showPopup ? "scale-in-center" : "scale-out-center"}`} >
                    {this.props.chosenImg}
                    {(this.props.enableEdit || this.props.enableDelete) &&
                        <div>
                            <div className="tool-bar-dark-background" />
                            <div className="tool-bar">
                                {this.props.enableEdit && <label className="tool-bar-label" htmlFor="image-uploader"><img className="edit" src={require('../../imgs/edit.svg')} /></label>}
                                {this.props.enableDelete && <img className="bin" src={require('../../imgs/bin.svg')} onClick={this.props.removeFile} />}
                            </div>
                        </div>}
                </div>
            </div>
        );
    }
}

export class PreviewWidgetExtension extends PreviewWidget {

    render() {
        return (
            <div className="preview-widget">
                {this.props.showPopup && <div className="dark-background" onClick={this.props.toggleShowPopup} />}
                <div className={`image-popup ${this.props.showPopup ? "scale-in-center" : "scale-out-center"}`} >
                    {this.props.chosenImg}
                    <h1>SHALVA </h1>
                </div>
            </div>
        );
    }
}