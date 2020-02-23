import React, { Component } from 'react';
import Auth from '../../../auth/Auth';
import MultiImagesHandler from '../../client/components/multi-images-handler/MultiImagesHandler';
import './MultiImagesHandlerView.scss';

const UploadedImage = (props) => {
    return (
        <div className='figure-container'>
            <figure>
                <img src={props.path} alt={props.title} title={props.title} />
                <figcaption>{props.description}</figcaption>
            </figure>
        </div>
    );
}

export default class MultiImagesHandlerView extends Component {

    constructor(props) {
        super(props);
        this.state = {
            uploadedImages: [],
            isSubmitDisabled: true
        };
    }

    onChange = (event) => {
        let name = (event.target && event.target.name) || null;
        let value = (event.target && event.target.value) || null;
        let isSubmitDisabled = true;
        if (isSubmitDisabled && value) isSubmitDisabled = false;
        this.setState({ [name]: value, isSubmitDisabled });
    }

    getFilesData = () => {
        const fieldsToSave = ['imgId'];

        let fieldsToSaveObj = {};
        for (let field of fieldsToSave) {
            if (this.state[field]) fieldsToSaveObj[field] = this.state[field];
        }

        return fieldsToSaveObj;
    }

    upload = async () => {
        this.setState({ isSubmitDisabled: true });

        let filesData = this.getFilesData();
        console.log("about to upload files", filesData);

        let [pRes, pErr] = await Auth.superAuthFetch('/api/Images', {
            method: 'POST',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify(filesData)
        });

        console.log("pRes", pRes);

        if (pErr) return console.log("ERR:", pErr);

        let filter = `filter[order]=id DESC&filter[limit]=${filesData["imgId"].length}`;
        let [gRes, gErr] = await Auth.superAuthFetch('/api/Images?' + filter);

        if (gErr) return console.log("ERR:", gErr);

        console.log("res", gRes);

        this.setState({ uploadedImages: gRes });
    };

    render() {
        let isSubmited = Object.keys(this.state.uploadedImages).length !== 0;

        return (
            <div className="multi-images-handler-sample">

                <h1>Multi Images Handler</h1>

                <div className="image-input-samples">

                    <div className="image-input-sample">
                        <MultiImagesHandler
                            name="imgId" // keyToSaveImgId
                            title="my-images"
                            category="games-images"
                            label="Drop your images"
                            onChange={this.onChange}
                            disabled={isSubmited}
                            checkImgMinSize={true}
                            multipleSizes={true}

                            
                            type="image" // image, audio, video, file
                            // accept=[".png", ".jpg"] // Accepting specific file types !mime types, one type!

                            // maxSizeInKB={}
                            // minSizeInKB={}
                            
                            // noClick=""
                            // noDrag=""
                            // noKeyBoard=""
                            previewFiles={[0,0]} //[accepted, rejected]

                            onDragEnter=""
                            onDragLeave=""
                            onDragOver=""
                            onDrop=""
                            onDropAccepted=""
                            onDropRejected=""
                            onFileDialogCancel=""
                           />
                    </div>
                </div>

                <p className="explanation">
                    <strong>Note:</strong> In this example the Submit button uploads all the chosen images to Images model<br />
                    (without saving a reference image_id in another model like in "Upload image to relative model (by creating a new game)" sample).<br/>
                    <strong>Notice:</strong> The MultiImageHandler does not support <em>required</em> prop.</p>

                {!isSubmited ?
                    <button onClick={this.upload} disabled={this.state.isSubmitDisabled}>Submit</button> :
                    <div className="uploaded-images">
                        {this.state.uploadedImages.map((uploadedImage, i) =>
                            <div key={i}>
                                <UploadedImage {...uploadedImage} />
                            </div>)}
                    </div>}
            </div>
        );
    }
}