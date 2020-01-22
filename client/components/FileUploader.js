import React, { Component } from 'react';

export default class FileUploader extends Component {

    constructor(props) {
        super(props);
        this.state = {
            thumbnail: this.props.defaultValue ?
                this.getFilePathExtension(this.props.defaultValue)
                : 'upload'
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
        if (!e.target || !e.target.files || !e.target.files.length === 0) { this.removeFile(); return; }

        let base64String = await this.readFileToBase64(e.target.files[0]);

        let extension = this.getFileBase64Extension(base64String);
        if (!extension) return;
        this.setState({ thumbnail: extension || 'upload' });

        let fileObj = {
            src: base64String,
            type: 'file',
            title: this.props.title || "default_file_title",
            category: this.props.category || "default_file_category",
            description: this.props.description || "default_file_description"
        };

        let eventObj = { target: { name: this.props.name, value: fileObj } }
        this.props.onChange(eventObj);
    }

    removeFile = () => {
        this.refs.fileUploaderInputRef.value = null;
        this.setState({ thumbnail: 'upload' });
        let eventObj = { target: { name: this.props.name, value: null } }
        this.props.onChange(eventObj);
    }

    getFilePathExtension = (fileSrc) => {
        const extensions = ['pdf', 'doc', 'docx'];
        const splitFilePath = fileSrc.split('/');
        const fileName = splitFilePath[splitFilePath.length - 1];
        const fileExtension = fileName.split('.')[1];

        return extensions.includes(fileExtension) ? fileExtension : 'upload';
    }

    getFileBase64Extension = (fileSrc) => {
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

        var mime = encoded.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,./);

        if (mime && mime.length) {
            result = mime[1];
        }

        return result;
    }

    render() {

        return (
            <div>
                {this.state.thumbnail !== 'upload' &&
                    <div onClick={this.removeFile}>{this.props.removeFileIcon || 'x'}</div>}
                <label>
                    <input
                        onChange={this.onChangeFile}
                        name="file"
                        required={this.props.required || false}
                        type="file"
                        accept=".docx, .doc, .pdf"
                        ref="fileUploaderInputRef"
                    />
                    <img
                        src={require(`./../../imgs/fileThumbnails/${this.state.thumbnail}-file-thumbnail.svg`)}
                        style={{ width: '6vw', margin: '2%' }}
                    />
                    <div>{this.props.label || "Upload File"}</div>
                </label>
            </div>);
    }
}
