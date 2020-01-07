import React, { Component } from 'react';
import defaultThumbnail from './../../imgs/default-thumbnail-img.png';

export default class VideoUploader extends Component {

    constructor(props) {
        super(props);

        this.state = {
            thumbnail: this.props.defaultValue || this.props.thumbnail || defaultThumbnail,
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
        this.refs.videoUploaderInputRef.value = null;
        this.setState({ thumbnail: this.props.thumbnail || defaultThumbnail });
        let eventObj = { target: { name: this.props.name, value: null } }
        this.props.onChange(eventObj);
    }

    onChangeVideo = async (e) => {
        // console.log("Image has changed");
        let base64String = await this.readFileToBase64(e.target.files[0]);
        this.setState({ thumbnail: base64String })

        let videoObj = {
            src: base64String,
            type: 'video',
            title: this.props.title || "default_video_title",
            category: this.props.category || "default_video_category",
            description: this.props.description || "default_video_description"
        };

        let eventObj = { target: { name: this.props.name, value: videoObj } }
        this.props.onChange(eventObj);
    }


    render() {

        return (
            <div>
                {(this.state.thumbnail !== this.props.thumbnail)
                    && (this.state.thumbnail !== defaultThumbnail)
                    && <div onClick={this.removeFile}>{this.props.removeFileIcon || 'x'}</div>}
                <label>
                    <input
                        onChange={this.onChangeVideo}
                        name="video"
                        required={this.props.required || false}
                        type="file"
                        accept="video/*"
                        ref="videoUploaderInputRef"
                    />
                    <video controls src={this.state.thumbnail} type={"video/*"} />
                    <div>{this.props.label || "Upload Video"}</div>
                </label>
            </div>
        );
    }
}
