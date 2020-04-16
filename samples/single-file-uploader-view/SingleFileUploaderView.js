import React, { Component } from 'react';
import Auth from '../../../auth/Auth';
import UploadedFile from '../uploaded-file/UploadedFile';
import Consts from "../../consts/Consts";
import './SingleFileUploaderView.scss';
import '../Samples.scss';

export default class SingleFileUploaderView extends Component {

    constructor(props) {
        super(props);

        this.type = Consts.FILE_TYPES.includes(this.props.type) ?
            this.props.type : Consts.FILE_TYPE_IMAGE;

        this.capitalizeType = this.capitalize(this.type);

        this.state = {
            isTable: false,
            uploadedFiles: [],
            isSubmitDisabled: true,
            isUploaderDisabled: false,
            filesToSave: {}
        };
    }

    capitalize = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
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

        let [res, err] = await Auth.superAuthFetch(`/api/${Consts.FILE_MODEL_NAME[this.type]}`, {
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
        let uploadedFilesIds = this.getUploadedFilesIds(postRes.filesUploadStatus, this.type);
        let filter = JSON.stringify({ "where": { "id": { "inq": uploadedFilesIds } } });
        let [res, err] = await Auth.superAuthFetch(`/api/${Consts.FILE_MODEL_NAME[this.type]}?filter=${filter}`);

        if (err) return console.log("ERR:", err);
        console.log("GET res", res);

        this.setState({ uploadedFiles: res });
    }

    toggleTable = () => {
        let isTable = !this.state.isTable;
        this.setState({ isTable });
    }

    addExtraProps = (Component, extraProps) => {
        return <Component.type {...Component.props} {...extraProps} />;
    }

    render() {
        let isSubmited = Object.keys(this.state.uploadedFiles).length !== 0;

        return (
            <div className="single-file-uploader-sample uploader-sample">

                <h1>{this.capitalizeType} Uploader</h1>

                <div className="uploader">
                    {this.props.uploader && this.addExtraProps(this.props.uploader, {
                        name: `${this.type}Id`, // keyToSaveFileId
                        title: `my-${this.type}s`,
                        category: `my-${this.type}s`,
                        onChange: this.handleFileChange,
                        disabled: this.state.isUploaderDisabled,
                        isErrorPopup: true
                    })}
                </div>

                <div className="usage">
                    <p>import {this.capitalizeType}Uploader from '/src/modules/fileshandler/client/components/${this.capitalizeType}Uploader.js</p>
                    <p>{`<${this.capitalizeType}Uploader
                        name="${this.type}Id"
                        title="my-${this.type}s"
                        category="my-${this.type}s"
                        label="Drop your ${this.type}s"
                        onChange={this.handleFileChange}
                        disabled={this.state.isUploaderDisabled} />`}</p>
                </div>

                {this.props.sqlImage && <img className="sql-image" src={this.props.sqlImage} />}

                {this.props.tableInfo && <div className="description p-1">

                    {this.state.isTable && <div className="m-2 mt-4 props-details" dir='ltr'>
                        <table class="table table-bordered">
                            <thead>
                                <tr>
                                    {this.props.tableInfo.thead.map((col, i) => <th key={i} scope="col">{col}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {this.props.tableInfo.tbody.map((row, i) =>
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
                </div>}

                <p className="explanation">
                    <strong>Note:</strong> In this example the Submit button uploads the chosen {this.type} to {Consts.FILE_MODEL_NAME[this.type]} model<br />
                    (without saving a reference {this.type}_id in another model like in "Upload image to relative model (by creating a new game)" sample).</p>

                {!isSubmited ?
                    <button onClick={this.upload} disabled={this.state.isSubmitDisabled}>Submit</button> :
                    <div className="uploaded-files">
                        {this.state.uploadedFiles.map((uploadedFile, i) =>
                            <div key={i}>
                                <UploadedFile {...uploadedFile} type={this.type} />
                            </div>)}
                    </div>}
            </div>
        );
    }
}