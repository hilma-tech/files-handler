import React, { Component } from 'react';
import Auth from '../../../auth/Auth';
import ImageHandler from '../../client/components/image-handler/ImageHandler';
import PreviewWidget from '../../client/components/PreviewWidget';
import './ImageHandlerView.scss';
// import './Samples.scss';

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

export default class ImageHandlerView extends Component {

    constructor(props) {
        super(props);
        this.state = {
            uploadedImages: [],
            isSubmitDisabled: true,
            isImgHandlerDisabled: false
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
        const fieldsToSave = ['imageSample1', 'imageSample2', 'imageSample3', 'imageSample4', 'imageSample5', 'imageSample6'];

        let fieldsToSaveObj = {};
        for (let field of fieldsToSave) {
            if (this.state[field]) fieldsToSaveObj[field] = this.state[field];
        }

        return fieldsToSaveObj;
    }

    upload = async () => {

        this.setState({ isSubmitDisabled: true, isImgHandlerDisabled: true });

        let filesData = this.getFilesData();
        console.log("about to upload files", filesData);

        let [pRes, pErr] = await Auth.superAuthFetch('/api/Images', {
            method: 'POST',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify(filesData)
        });

        if (pErr) return console.log("ERR:", pErr);

        let filter = `filter[order]=id DESC&filter[limit]=${Object.keys(filesData).length}`;
        let [gRes, gErr] = await Auth.superAuthFetch('/api/Images?' + filter);

        if (gErr) return console.log("ERR:", gErr);

        console.log("res", gRes);

        this.setState({ uploadedImages: gRes });
    };

    render() {
        let isSubmited = Object.keys(this.state.uploadedImages).length !== 0;

        return (
            <div className="image-handler-sample">

                <h1>Image Handler</h1>
                <p className="explanation"><strong>Note:</strong> When using multiple ImageUploader's,
                make sure to give each one a unique <em>name</em> prop.</p>

                <p className="explanation">There are a few basic styles you can easly implement by adding props.</p>

                <div className="image-input-samples">

                    <div className="image-input-sample">
                        <p>This is the default-theme style. No <em>theme</em> prop is required.</p>
                        <ImageHandler
                            category="my-images" // image is saved into public/images/[category]
                            name="imageSample1"
                            title="my-image"
                            onChange={this.handleFileChange}
                            disabled={this.state.isImgHandlerDisabled}
                        />
                    </div>

                    <div className="image-input-sample">
                        <p>This is the basic-theme style. You can achieve it by adding <em>theme="basic-theme"</em> as a prop.</p>
                        <ImageHandler
                            category="my-images" // image is saved into public/images/[category]
                            name="imageSample2"
                            title="my-image"
                            theme="basic-theme"
                            onChange={this.handleFileChange}
                            disabled={this.state.isImgHandlerDisabled}
                        />
                    </div>

                    <div className="image-input-sample">
                        <p>This is the circle-theme style. You can achieve it by adding <em>theme="circle-theme"</em> as a prop.</p>
                        <ImageHandler
                            category="my-images" // image is saved into public/images/[category]
                            name="imageSample3"
                            title="my-image"
                            theme="circle-theme"
                            onChange={this.handleFileChange}
                            disabled={this.state.isImgHandlerDisabled}
                        />
                    </div>
                </div>

                <p className="explanation">
                    Below are two examples with the default previewWidget.<br />
                    You can achieve it by adding <em>previewWidget={"{<PreviewWidget/>}"}</em> as a prop.<br />
                    The previewWidget component can be controled with <em>enableEdit</em> and <em>enableDelete</em> props which by default are unabled.<br />
                    (The previewWidget component can be imported from modules/fileshandler/client/componens/PreviewWidget.js)<br />
                    The default previewWidget component can be easly replaced by costume previewWidget component which extends the original.</p>

                <div className="image-input-samples">

                    <div className="image-input-sample">
                        <p>This is previewWidget with the default-theme style.</p>
                        <ImageHandler
                            category="my-images" // image is saved into public/images/[category]
                            name="imageSample4"
                            title="my-image"
                            previewWidget={<PreviewWidget />}
                            onChange={this.handleFileChange}
                            disabled={this.state.isImgHandlerDisabled}
                        />
                    </div>

                    <div className="image-input-sample">
                        <p>This is previewWidget with the basic-theme style.<br />
                            Only <em>enableEdit</em> is enabled.</p>
                        <ImageHandler
                            category="my-images" // image is saved into public/images/[category]
                            name="imageSample5"
                            title="my-image"
                            theme="basic-theme"
                            previewWidget={<PreviewWidget enableEdit={true} />}
                            onChange={this.handleFileChange}
                            disabled={this.state.isImgHandlerDisabled}
                        />
                    </div>

                    <div className="image-input-sample">
                        <p>This is previewWidget with the circle-theme style.<br />
                            <em>enableEdit</em> and <em>enableDelete</em> props are enabled.</p>
                        <ImageHandler
                            category="my-images" // image is saved into public/images/[category]
                            name="imageSample6"
                            title="my-image"
                            theme="circle-theme"
                            previewWidget={<PreviewWidget enableEdit={true} enableDelete={true} />}
                            onChange={this.handleFileChange}
                            disabled={this.state.isImgHandlerDisabled}
                        />
                    </div>
                </div>

                <p className="explanation">
                    <strong>Note:</strong> In this example the Submit button uploads all the chosen images to Images model<br />
                    (without saving a reference image_id in another model like in "Upload image to relative model (by creating a new game)" sample).</p>

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