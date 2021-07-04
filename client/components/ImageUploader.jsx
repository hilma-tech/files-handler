import React, { Component } from 'react';
import { async } from 'validate.js';
import { DefaultDayPost } from '../../../../components';
import defaultThumbnail from './../../imgs/default-thumbnail-img.png';
import { IconButton, Snackbar } from '@material-ui/core';
import { Close } from '@material-ui/icons';


/********************THIS VERSION WILL BE DEPRECATED************************/

export default class ImageUploader extends Component {

    constructor(props) {
        super(props);

        this.state = {
            thumbnail: this.props.defaultValue || this.props.thumbnail || this.props.defaultThumbnailImageSrc || defaultThumbnail,
            // defaultValue: this.props.defaultValue || defaultThumbnail
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
        if (this.state.thumbnail === (this.props.thumbnail || defaultThumbnail)) return;
        this.refs.imageUploaderInputRef.value = null;
        this.setState({ thumbnail: this.props.thumbnail || defaultThumbnail });
        let eventObj = { target: { name: this.props.name, value: null } }
        this.props.onChange(eventObj);
    }

    onChangeImg = async (e) => {
        // console.log("Image has changed");
        let fileURl = ""
        if(window.Capacitor){
            fileURl = e
        } else {
            fileURl = e.target.files[0]
        }
        
        let base64String = await this.readFileToBase64(fileURl);
        if(!window.Capacitor){
            this.setState({ thumbnail: base64String })
        }
        let imageObj = {
            src: base64String,
            type: 'image',
            title: this.props.title || "default_image_title",
            category: this.props.category || "default_image_category",
            description: this.props.description || "default_image_description"
        };
        
        let eventObj = { target: { name: this.props.name, value: imageObj } }
        console.log('eventObj: ', eventObj);
        this.props.onChange(eventObj);
        console.log('this.props.closePopUp: ', this.props.closePopUp);
        if (this.props.closePopUp !== undefined) {
            this.props.closePopUp()
        }
    }

    takePhotoForCapacitor = () => {
        if (window.Capacitor) {
            document.addEventListener("deviceready", this.takePicture, false);
        }
    }

    takePicture = async () => {
        this.clicked = true
        try{
            const imageUrl = await window.Capacitor.Plugins.Camera.getPhoto({
                quality: 90,
                resultType: 'dataUrl',
                source: 'PHOTOS'
            });
            console.log('imageUrl.dataUrl: ', imageUrl.dataUrl);
            await this.onChangeImg(imageUrl.dataUrl)
        }catch(e){
            console.log('e: ', e);
        }
        if (this.props.closePopUp !== undefined) {
            this.props.closePopUp()
        }
    }

    render() {
        return (
            <div onClick={this.takePhotoForCapacitor}>
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
                        height={this.props.small ? "25px" : "100px"}
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