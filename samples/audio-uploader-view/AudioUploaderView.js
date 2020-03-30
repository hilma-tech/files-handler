import React, { Component } from 'react';
import Auth from '../../../auth/Auth';
import AudioUploader from '../../client/components/AudioUploader';
import TableInfo from './TableInfo.json';
import '../Samples.scss';

export default class AudioUploaderView extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isTable: false,
            isSubmitDisabled: true,
            isAudioUploaderDisabled: false
        };
    }

    handleFileChange = (fileEvent) => {
        let name = (fileEvent.target && fileEvent.target.name) || null;
        let value = (fileEvent.target && fileEvent.target.value) || null;
        let isSubmitDisabled = true;
        if (isSubmitDisabled && value) isSubmitDisabled = false;
        this.setState({ [name]: value, isSubmitDisabled });
    }

    getFilesData = () => {
        const fieldsToSave = ['audioSample'];

        let fieldsToSaveObj = {};
        for (let field of fieldsToSave) {
            if (this.state[field]) fieldsToSaveObj[field] = this.state[field];
        }

        return fieldsToSaveObj;
    }

    upload = async () => {

        this.setState({ isSubmitDisabled: true, isAudioUploaderDisabled: true });

        let filesData = this.getFilesData();
        console.log("about to upload files", filesData);

        let [pRes, pErr] = await Auth.superAuthFetch('/api/Files', {
            method: 'POST',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify(filesData)
        });

        if (pErr) return console.log("ERR:", pErr);
        console.log("POST res", pRes)
    };

    toggleTable = () => {
        let isTable = !this.state.isTable;
        this.setState({ isTable });
    }

    render() {
        return (
            <div className="uploader-sample">
                <div className="file-uploader-sample">

                    <h1>Audio Uploader</h1>
                    <h3>Supported file's formats: mp3, wav, webm</h3>

                    <div className="uploader">
                        <AudioUploader
                            category='uploaded_audio' // audio is saved into public/files/[category]
                            name='audioSample' // [AUDIO_NAME_LIKE_IN_DATABASE]
                            required={false}
                            onChange={this.handleFileChange}
                        />
                    </div>

                    <div className="usage">
                        <p>import FileUploader from '/src/modules/fileshandler/client/components/FileUploader.js</p>
                        <p>{`<AudioUploader
                            category='uploaded_audio'
                            name='audioSample'
                            required={false}
                            onChange={this.handleFileChange}
                            label='Choose your favorite song'
                        />`}</p>
                    </div>

                    {/* <img className="sql-image" src={require('./audios-sql.png')} /> */}

                    <div className="description p-1">

                        {this.state.isTable && <div className="m-2 mt-4 props-details" dir='ltr'>
                            <table class="table table-bordered">
                                <thead>
                                    <tr>
                                        {TableInfo.thead.map((col, i) => <th key={i} scope="col">{col}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {TableInfo.tbody.map((row, i) =>
                                        <tr key={i}>
                                            <td>{row.Property}</td>
                                            <td>{row.Type}</td>
                                            <td>{row.Description}</td>
                                            <td>{row.Default}</td>
                                        </tr>)}
                                </tbody>
                            </table>
                        </div>}

                        <button onClick={this.toggleTable}>{!this.state.isTable ? "Show props details" : "Show less"}</button>
                    </div>

                    <p className="explanation">
                        <strong>Note:</strong> In this example the Submit button uploads all the chosen audios to Audios model<br />
                        (without saving a reference audio_id in another model like in "Upload image to relative model (by creating a new game)" sample).</p>

                    <button onClick={this.upload} disabled={this.state.isSubmitDisabled}>Submit</button>
                </div>
            </div>
        );
    }
}