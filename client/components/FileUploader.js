import React, { Component } from 'react';

export default class FileUploader extends Component {

    constructor(props) {
        super(props);
        this.state = { thumbnail: 'upload' };
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
        let base64String = await this.readFileToBase64(e.target.files[0]);

        let extension = this.getFileExtension(base64String)
        this.setState({ thumbnail: extension || 'upload' });

        let fileObj = {
            src: base64String,
            type: 'file',
            title: this.props.title,
            category: this.props.category
        };

        let eventObj = { target: { name: this.props.name, value: fileObj } }
        this.props.onChange(eventObj);
    }

    getFileExtension = (fileSrc) => {
        let mimeType = this.base64MimeType(fileSrc);
        if (!mimeType) return null;

        const mimeTypes = {
            pdf: 'application/pdf',
            doc: 'application/msword',
            docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            upload: ''
        };

        return Object.keys(mimeTypes).find(key => mimeTypes[key] === mimeType);
    }

    base64MimeType = (encoded) => {
        var result = null;

        if (typeof encoded !== 'string') {
            return result;
        }

        var mime = encoded.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);

        if (mime && mime.length) {
            result = mime[1];
        }

        return result;
    }

    render() {

        return (
            <div>
                <label>
                    <input
                        onChange={this.onChangeFile}
                        name="file"
                        required={this.props.required || false}
                        type="file"
                        accept=".docx, .doc, .pdf"
                    />
                    <img
                        src={require(`./../../imgs/fileThumbnails/${this.state.thumbnail}-file-thumbnail.svg`)}
                        style={{ width: '6vw', margin: '2%' }}
                    />
                    <div>{this.props.label}</div>
                </label>
            </div>);
    }
}