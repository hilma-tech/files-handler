import React, { Component } from 'react';
import Auth from '../../../auth/Auth';
import FileUploader from '../../client/components/FileUploader';
import TableInfo from './TableInfo.json';
import '../Samples.scss';

export default class FileUploaderView extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isTable: false,
            isSubmitDisabled: true,
            isFileUploaderDisabled: false
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
        const fieldsToSave = ['fileSample'];

        let fieldsToSaveObj = {};
        for (let field of fieldsToSave) {
            if (this.state[field]) fieldsToSaveObj[field] = this.state[field];
        }

        return fieldsToSaveObj;
    }

    upload = async () => {

        this.setState({ isSubmitDisabled: true, isFileUploaderDisabled: true });

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

                    <h1>File Uploader</h1>
                    <h3>Supported file's formats: doc, docx, pdf</h3>

                    <div className="uploader">
                        <FileUploader
                            category='uploaded_files' // file is saved into public/files/[category]
                            name='fileSample' // [FILE_NAME_LIKE_IN_DATABASE]
                            required={true}
                            onChange={this.handleFileChange}
                            label='CV'
                        />
                    </div>

                    <div className="usage">
                        <p>import FileUploader from '/src/modules/fileshandler/client/components/FileUploader.js</p>
                        <p>{`<FileUploader
                            category='uploaded_files'
                            name='fileSampleId'
                            required={true}
                            onChange={this.handleFileChange}
                            label='CV'
                        />`}</p>
                    </div>

                    <img className="sql-image" src={require('./files-sql.png')} />

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
                        <strong>Note:</strong> In this example the Submit button uploads all the chosen files to Files model<br />
                        (without saving a reference file_id in another model like in "Upload image to relative model (by creating a new game)" sample).</p>

                    <button onClick={this.upload} disabled={this.state.isSubmitDisabled}>Submit</button>
                </div>
            </div>
        );
    }
}