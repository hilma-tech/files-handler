import React, { Component } from 'react';

export default class AudioUploader extends Component {

    constructor(props) {
        super(props);
        this.state = {
            audioSrc: this.props.defaultValue ? this.props.defaultValue :
                (this.props.defaultAudioSrc ? this.props.defaultAudioSrc : '')
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

    onChangeFile = async (e) => {
        if (!e.target.files[0]) return;

        let base64String = await this.readFileToBase64(e.target.files[0]);
        this.setState({ audioSrc: base64String });

        let fileObj = {
            src: base64String,
            type: 'audio',
            title: this.props.title || "default_audio_title",
            category: this.props.category || "default_audio_category",
            description: this.props.description || "default_audio_description"
        };

        let eventObj = { target: { name: this.props.name, value: fileObj } }
        this.props.onChange(eventObj);

    }

    render() {

        return (
            <div>
                <audio controls src={this.state.audioSrc} type={"audio/*"} />

                <label>
                    <input
                        onChange={this.onChangeFile}
                        name="file"
                        required={this.props.required || false}
                        type="file"
                        accept=".mp3, .wav, .webm" 
                    />
                    <div>{this.props.label || "Upload Audio"}</div>
                </label>
            </div>);
    }
}
