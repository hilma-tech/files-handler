import React, { Component } from 'react';
import Dropzone from 'react-dropzone';
import './MultiImagesHandler.scss';

export default class MultiImagesHandler extends Component {
    constructor(props) {
        super(props);

        this.state = {
            files: []
        };
    }

    onDrop = async (acceptedfiles, rejectedFiles) => {
        let files = [];
        let imagesObjs = [];

        for (let i = 0; i < acceptedfiles.length; i++) {

            let base64String = await this.readFileToBase64(acceptedfiles[i]);
            files.push({ preview: base64String });

            let imageObj = {
                src: base64String,
                type: 'image',
                title: this.props.title || "default_image_title",
                category: this.props.category || "default_image_category",
                description: this.props.description || "default_image_description",
                relatedModelToSaveImgId: this.props.relatedModelToSaveImgId || {}
            };

            imagesObjs.push(imageObj);
        }

        // Display previews of the accepted files
        this.setState({ files });

        // Calls the onChange callback
        let eventObj = { target: { name: this.props.name || "multiImagesHandler", value: imagesObjs } };
        this.props.onChange(eventObj);
    };

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

    render() {
        const thumbs = this.state.files.map((file, i) => (
            <div className='thumb' key={i}>
                <div className='thumb-inner'>
                    <img className="img" src={file.preview} />
                </div>
            </div>
        ));

        return (
            <div className="multi-images-handler">
                <Dropzone onDrop={this.onDrop} accept='image/*' disabled={this.props.disabled}>
                    {({ getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject }) => {
                        let classNames = `dropzone 
                        ${isDragActive && 'drag-active'} 
                        ${isDragAccept && 'drag-accept'} 
                        ${isDragReject && 'drag-reject'}`;

                        return (
                            <section className="container">
                                <div {...getRootProps({ className: classNames })}>
                                    <input {...getInputProps()} />
                                    <p>{this.props.label || "Drag & drop some files here, or click to select files"}</p>
                                </div>
                                <aside className='thumbs-container'>
                                    {thumbs}
                                </aside>
                            </section>)}}
                </Dropzone>
            </div>
        )
    }
}