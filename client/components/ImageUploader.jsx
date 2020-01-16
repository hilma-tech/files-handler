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

    getPropertiesForTheme = () => {
        let chosenImgStyle = { backgroundImage: `url(${this.state.thumbnail}), url(${this.props.thumbnail || this.defaultThumbnail})` }  // the second url is in case the first is failed to load
        let chosenImage = <div className="chosen-img" style={chosenImgStyle} onClick={this.props.previewWidget && this.toggleShowPopup} />;
        let previewWidgetChosenImg = <div className="chosen-img-preview" style={chosenImgStyle} />;
        let themeClassName, parentClassName;

        switch (this.props.theme) {
            case "basic-theme":
                themeClassName = "basic-theme";
                parentClassName = "chosen-image-parent";
                break;

            case "circle-theme":
                themeClassName = "circle-theme";
                parentClassName = "chosen-image-parent";
                break;

            default: // "default-theme"
                themeClassName = "default-theme";
                parentClassName = "";
                chosenImage = <img
                    src={this.state.thumbnail}
                    height="100px"
                    width="auto"
                    alt="uploading image"
                    onClick={this.props.previewWidget && this.toggleShowPopup}
                    onError={e => {
                        e.target.src = this.props.thumbnail || this.defaultThumbnail;
                        this.setState({ thumbnail: this.props.thumbnail || this.defaultThumbnail });
                    }} />;
                break;
        }

        return [themeClassName, parentClassName, chosenImage, previewWidgetChosenImg];
    }

    render() {

        let [themeClassName, parentClassName, chosenImage, previewWidgetChosenImg] = this.getPropertiesForTheme();

        if (!this.props.theme && !this.props.previewWidget) return( // Supports previous versions
            <div>
                {(this.state.thumbnail !== this.props.thumbnail)
                    && (this.state.thumbnail !== this.defaultThumbnail)
                    && (this.state.thumbnail !== this.props.defaultThumbnailImageSrc) &&
                    <div onClick={this.removeFile}>{this.props.removeFileIcon || 'x'}</div>}
                <label>
                    <input
                        onChange={this.onChangeImg}
                        name="image"
                        required={this.props.required || false}
                        type="file"
                        accept=".png, .jpg, .jpeg, .gif, .svg"
                        ref="imageUploaderInputRef"
                    />
                    <img
                        src={this.state.thumbnail}
                        height="100px"
                        width="auto"
                        alt="uploading image"
                        onError={e => {
                            e.target.src = this.props.thumbnail || this.defaultThumbnail;
                            this.setState({ thumbnail: this.props.thumbnail || this.defaultThumbnail });
                        }}
                    />
                    <div>{this.props.label || "Upload Image"}</div>
                </label>
            </div>
        )

        return (
            <div dir="ltr" className="image-uploader-container">
                <div className={themeClassName}>
                    <input
                        id={this.props.name}
                        onChange={this.onChangeImg}
                        name="image"
                        required={this.props.required || false}
                        type="file"
                        accept=".png, .jpg, .jpeg, .gif, .svg"
                        ref="imageUploaderInputRef" />

                    {this.props.previewWidget ?
                        chosenImage :

                        <div className={parentClassName}>

                            <label htmlFor={this.props.name}>
                                {chosenImage}
                                <div className="label">{this.props.label || "Choose image"}</div>
                            </label>

                            {(this.state.thumbnail !== this.props.thumbnail) && (this.state.thumbnail !== this.defaultThumbnail) &&
                                (this.state.thumbnail !== this.props.defaultThumbnailImageSrc) &&

                                <div onClick={this.removeFile}>
                                    {this.props.removeFileIcon ||
                                        <img className="remove-button" src={require('../../imgs/x-icon.png')} alt="x" />}
                                </div>}
                        </div>}

                    {this.props.previewWidget &&
                        typeof this.state.showPopup === "boolean" &&
                        this.addExtraProps(this.props.previewWidget, {
                            chosenImg: previewWidgetChosenImg,
                            showPopup: this.state.showPopup,
                            toggleShowPopup: this.toggleShowPopup,
                            removeFile: this.removeFile,
                            inputId: this.props.name
                        })}
                </div>
            </div>
        );
    }
}