import React from 'react';
import SingleFileUploaderView from '../single-file-uploader-view/SingleFileUploaderView';
import ImageUploader from '../../client/components/ImageUploader.jsx';
import UploadedFile from '../uploaded-file/UploadedFile';
import PreviewWidget from '../../client/components/PreviewWidget';
import TableInfo from './TableInfo.json';
import Consts from '../../consts/Consts';
import './ImageUploaderView.scss';

export default class ImageUploaderVIew extends SingleFileUploaderView {

    constructor(props) {
        props = { ...props };
        props.type = Consts.FILE_TYPE_IMAGE;
        super(props);
    }

    render() {
        let isSubmited = Object.keys(this.state.uploadedFiles).length !== 0;

        return (
            <div className="uploader-sample">
                <div className="image-uploader-sample">

                    <h1>Image Uploader</h1>
                    <h3>Supported file's formats: jpg, png, jpeg, gif, svg</h3>

                    <div className="uploader">
                        <ImageUploader
                            category="my-images" // image is saved into public/images/[category]
                            name="imageSample"
                            title="my-image"
                            theme="basic-theme"
                            onChange={this.handleFileChange}
                            disabled={this.state.isUploaderDisabled}
                        />
                    </div>

                    <div className="usage">
                        <p>import ImageUploader from '/src/modules/fileshandler/client/components/ImageUploader.js</p>
                        <p>{`<ImageUploader
                            category="my-images"
                            name="imageSample"
                            title="my-image"
                            theme="basic-theme"
                            onChange={this.handleFileChange}
                            disabled={this.state.isUploaderDisabled}
                            checkImgMinSize={true} />`}</p>
                    </div>

                    <img className="sql-image" src={require('./images-sql.png')} />

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

                    <p className="explanation">There are a few basic styles you can easly implement by adding props.</p>

                    <div className="image-input-samples">

                        <div className="image-input-sample">
                            <p>This is the default-theme [deprecated] style. No <em>theme</em> prop is required.</p>
                            <ImageUploader
                                category="my-images" // image is saved into public/images/[category]
                                name="imageSample1"
                                title="my-image"
                                onChange={this.handleFileChange}
                                disabled={this.state.isUploaderDisabled}
                            />
                        </div>

                        <div className="image-input-sample">
                            <p>This is the basic-theme style. You can achieve it by adding <em>theme="basic-theme"</em> as a prop.</p>
                            <ImageUploader
                                category="my-images" // image is saved into public/images/[category]
                                name="imageSample2"
                                title="my-image"
                                theme="basic-theme"
                                onChange={this.handleFileChange}
                                disabled={this.state.isUploaderDisabled}
                            />
                        </div>

                        <div className="image-input-sample">
                            <p>This is the circle-theme style. You can achieve it by adding <em>theme="circle-theme"</em> as a prop.</p>
                            <ImageUploader
                                category="my-images" // image is saved into public/images/[category]
                                name="imageSample3"
                                title="my-image"
                                theme="circle-theme"
                                onChange={this.handleFileChange}
                                disabled={this.state.isUploaderDisabled}

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
                            <p>This is previewWidget with the default-theme [deprecated] style.</p>
                            <ImageUploader
                                category="my-images" // image is saved into public/images/[category]
                                name="imageSample4"
                                title="my-image"
                                previewWidget={<PreviewWidget />}
                                onChange={this.handleFileChange}
                                disabled={this.state.isUploaderDisabled}
                            />
                        </div>

                        <div className="image-input-sample">
                            <p>This is previewWidget with the basic-theme style.<br />
                                Only <em>enableEdit</em> is enabled.</p>
                            <ImageUploader
                                category="my-images" // image is saved into public/images/[category]
                                name="imageSample5"
                                title="my-image"
                                theme="basic-theme"
                                previewWidget={<PreviewWidget enableEdit={true} />}
                                onChange={this.handleFileChange}
                                disabled={this.state.isUploaderDisabled}
                            />
                        </div>

                        <div className="image-input-sample">
                            <p>This is previewWidget with the circle-theme style.<br />
                                <em>enableEdit</em> and <em>enableDelete</em> props are enabled.</p>
                            <ImageUploader
                                category="my-images" // image is saved into public/images/[category]
                                name="imageSample6"
                                title="my-image"
                                theme="circle-theme"
                                previewWidget={<PreviewWidget enableEdit={true} enableDelete={true} />}
                                onChange={this.handleFileChange}
                                disabled={this.state.isUploaderDisabled}
                            />
                        </div>
                    </div>

                    <p className="explanation">When <em>isMultiSizes</em> is true (like in this example), the chosen images is resized and uploaded in maximum 3 different versions: small, mediuim and large.<br />
                        The images are saved at public/imgs/[category]/[image_id].[s/m/l].[format]<br />
                        The original image is resized only to smaller versions, which means that in some cases the image will have only medium and small versions, and in others only small.<br />
                        When the image and it's versions are uploaded, only 1 new instance is created at Images model.<br />
                        At the res of GETing the image, there will be a <em>isMultiSizes</em> prop (in addition to the <em>path</em> prop).<br />
                        At <em>isMultiSizes</em> there is an array with all the existing pathes of the different versions of the spesific image.</p>

                    <div className="image-input-samples">

                        <div className="image-input-sample">
                            <ImageUploader
                                category="my-images" // image is saved into public/images/[category]
                                name="imageSample7"
                                title="my-image"
                                theme="basic-theme"
                                onChange={this.handleFileChange}
                                isMultiSizes={true}
                                disabled={this.state.isUploaderDisabled}
                            />
                        </div>
                    </div>

                    <p className="explanation">
                        <strong>Note:</strong> In this example the Submit button uploads all the chosen images to Images model<br />
                        (without saving a reference image_id in another model like in "Upload image to relative model (by creating a new game)" sample).</p>

                    {!isSubmited ?
                        <button onClick={this.upload} disabled={this.state.isSubmitDisabled}>Submit</button> :
                        <div className="uploaded-images">
                            {this.state.uploadedFiles.map((uploadedImage, i) =>
                                <div key={i}>
                                    <UploadedFile {...uploadedImage} type={Consts.FILE_TYPE_IMAGE}/>
                                </div>)}
                        </div>}
                </div>
            </div>
        );
    }
}