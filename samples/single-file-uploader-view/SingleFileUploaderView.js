import React, { Component } from 'react';
import Auth from '../../../auth/Auth';
import SingleFileUploader from '../../client/components/single-file-uploader/SingleFileUploader';
import TableInfo from './TableInfo.json';
import UploadedFile from '../uploaded-file/UploadedFile';
import Consts from "../../consts/Consts";
import './SingleFileUploaderView.scss';
import '../Samples.scss';

export default class SingleFileUploaderView extends Component {

    constructor(props) {
        super(props);
        this.state = {
            type: Consts.FILE_TYPE_IMAGE,
            isTable: false,
            uploadedFiles: [],
            isSubmitDisabled: true,
            isUploaderDisabled: false,
            filesToSave: {}
        };
    }

    onTypeChange = (event) => {
        let value = (event.target && event.target.value) || null;
        let newState = {
            type: value,
            uploadedFiles: [],
            isSubmitDisabled: true,
            isUploaderDisabled: false,
            filesToSave: {}
        }
        this.setState({...newState});
    }

    handleFileChange = (fileEvent) => {
        let name = (fileEvent.target && fileEvent.target.name) || null;
        let value = (fileEvent.target && fileEvent.target.value) || null;
        let isSubmitDisabled = true;
        if (isSubmitDisabled && value) isSubmitDisabled = false;
        let filesToSave = { ...this.state.filesToSave };
        filesToSave[name] = value;
        this.setState({ filesToSave, isSubmitDisabled });
    }

    getFilesData = () => {
        return { ...this.state.filesToSave };
    }

    upload = async () => {
        this.setState({ isSubmitDisabled: true, isUploaderDisabled: true });
        let filesData = this.getFilesData();
        console.log("about to upload files", filesData);

        let [res, err] = await Auth.superAuthFetch(`/api/${Consts.FILE_MODEL_NAME[this.state.type]}`, {
            method: 'POST',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify(filesData)
        });

        if (err) return console.log("ERR:", err);
        console.log("POST res", res);

        await this.previewUploadedFiles(res);
    };

    getUploadedFilesIds = (filesUploadStatus, filterByType = Consts.FILE_TYPE_IMAGE) => {
        let fileIds = [];
        for (let fileKeys in filesUploadStatus) {
            let fileOrFiles = filesUploadStatus[fileKeys];

            const pushToFileIds = (file) => {
                if (file.status === Consts.FILE_ACCEPTED && file.type === filterByType) {
                    fileIds.push(file.id)
                }
            }

            if (Array.isArray(fileOrFiles)) {
                fileOrFiles.forEach(file => pushToFileIds(file));
            }
            else {
                pushToFileIds(fileOrFiles);
            }
        }

        return fileIds;
    }

    previewUploadedFiles = async (postRes) => {
        if (!postRes || !postRes.filesUploadStatus) return;
        let uploadedFilesIds = this.getUploadedFilesIds(postRes.filesUploadStatus, this.state.type);
        let filter = JSON.stringify({ "where": { "id": { "inq": uploadedFilesIds } } });
        let [res, err] = await Auth.superAuthFetch(`/api/${Consts.FILE_MODEL_NAME[this.state.type]}?filter=${filter}`);

        if (err) return console.log("ERR:", err);
        console.log("GET res", res);

        this.setState({ uploadedFiles: res });
    }

    toggleTable = () => {
        let isTable = !this.state.isTable;
        this.setState({ isTable });
    }

    render() {
        let isSubmited = Object.keys(this.state.uploadedFiles).length !== 0;

        return (
            <div className="single-file-uploader-sample uploader-sample">

                <h1>Single File Uploader</h1>
                <h3>Choose file type:</h3>

                <select name="type" value={this.state.type} onChange={this.onTypeChange}>
                    <option value="image">Image</option>
                    <option value="audio">Audio</option>
                    <option value="video">Video</option>
                    <option value="file">File</option>
                </select>

                <div className="uploader">
                    <SingleFileUploader
                        name={`${this.state.type}Id`} // keyToSaveFileId
                        title={`my-${this.state.type}s`}
                        category={`my-${this.state.type}s`}
                        onChange={this.handleFileChange}
                        disabled={this.state.isUploaderDisabled}
                        type={this.state.type} // image, audio, video, file
                    />
                </div>

                <div className="usage">
                    <p>import SingleFileUploader from '/src/modules/fileshandler/client/components/single-file-uploader/SingleFileUploader.js</p>
                    <p>{`<SingleFileUploader
                        name="${this.state.type}Id"
                        title="my-${this.state.type}s"
                        category="my-${this.state.type}s"
                        label="Drop your ${this.state.type}s"
                        onChange={this.handleFileChange}
                        disabled={this.state.isUploaderDisabled}
                        type=${this.state.type} />`}</p>
                </div>

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
                    <strong>Note:</strong> In this example the Submit button uploads the chosen {this.state.type} to {Consts.FILE_MODEL_NAME[this.state.type]} model<br />
                    (without saving a reference {this.state.type}_id in another model like in "Upload image to relative model (by creating a new game)" sample).</p>

                {!isSubmited ?
                    <button onClick={this.upload} disabled={this.state.isSubmitDisabled}>Submit</button> :
                    <div className="uploaded-files">
                        {this.state.uploadedFiles.map((uploadedFile, i) =>
                            <div key={i}>
                                <UploadedFile {...uploadedFile} type={this.state.type} />
                            </div>)}
                    </div>}
            </div>
        );
    }
}