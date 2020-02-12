import React, { Component } from 'react';
import defaultThumbnail from './../../imgs/default-thumbnail-img.png';
import Consts from '../../consts/Consts.json';

/********************THIS VERSION WILL BE DEPRECATED************************/

export default class ImageUploader extends Component {

    constructor(props) {
        super(props);

        this.state = {
            thumbnail: this.props.defaultValue || this.props.thumbnail || this.props.defaultThumbnailImageSrc || defaultThumbnail,
            // defaultValue: this.props.defaultValue || defaultThumbnail
            maxSize: this.props.maxSize || Consts.FILE_MAX_SIZE_IN_KB
        };
        this.onChangeImg = this.onChangeImg.bind(this);
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
        if (this.state.thumbnail === (this.props.thumbnail || defaultThumbnail)) return;
        this.refs.imageUploaderInputRef.value = null;
        this.setState({ thumbnail: this.props.thumbnail || defaultThumbnail });
        let eventObj = { target: { name: this.props.name, value: null } }
        this.props.onChange(eventObj);
    }

    async onChangeImg(e) {
        let sizeMB = e.target.files[0].size * 0.001;
        if (sizeMB > this.state.maxSize) { console.error('img is to big'); return; }

        // console.log("Image has changed");
        let base64String = await this.readFileToBase64(e.target.files[0]);
        this.setState({ thumbnail: base64String })

        let imageObj = {
            src: base64String,
            type: 'image',
            title: this.props.title || "default_image_title",
            category: this.props.category || "default_image_category",
            description: this.props.description || "default_image_description",
            multipleSizes: this.props.multipleSizes ? true : false
        };

        let eventObj = { target: { name: this.props.name, value: imageObj } }
        this.props.onChange(eventObj);
    }

    render() {

        return (
            <div>
                {(this.state.thumbnail !== this.props.thumbnail)
                    && (this.state.thumbnail !== defaultThumbnail)
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
                            e.target.src = this.props.thumbnail || defaultThumbnail;
                            this.setState({ thumbnail: this.props.thumbnail || defaultThumbnail });
                        }}
                    />
                    <div>{this.props.label || "Upload Image"}</div>
                </label>
            </div>
        );
    }
}