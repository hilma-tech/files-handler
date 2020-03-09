import React, { Component } from 'react';
import Auth from '../../../auth/Auth';
import '../Samples.scss';

export default class VideoUploaderView extends Component {

    constructor(props) {
        super(props);
        this.state = {};
        this.STRING = ""
    }

    handleFileChange = (fileEvent) => {
        console.log(fileEvent)
        let name = (fileEvent.target && fileEvent.target.name) || null;
        let value = (fileEvent.target && fileEvent.target.value) || null;
        if (name && value) {
            this.setState({ [name]: value });
        }
    }

    getFilesData = () => {
        const fieldsToSave = ['fileSampleId', 'audioSampleId', 'imageSampleId'];

        let fieldsToSaveObj = {};
        for (let field of fieldsToSave) {
            fieldsToSaveObj[field] = this.state[field];
        }

        return fieldsToSaveObj;
    }

    upload = () => {
        let filesData = this.getFilesData();

        console.log("about to upload files YAYYYAY:)", filesData)
        Auth.superAuthFetch('/api/Files', {
            method: 'POST',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify(filesData)
        })
    };

    render() {
        return (
            <div>
                hello
            </div>
        );
    }
}
