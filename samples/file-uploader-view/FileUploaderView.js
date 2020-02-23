import React, { Component } from 'react';
import Auth from '../../../auth/Auth';
import FileUploader from '../../client/components/FileUploader';
import AudioUploader from '../../client/components/AudioUploader';
import ImageUploader from '../../client/components/ImageUploader';
import screenImg from "./screenShotImages.png";
import screenfile from "./fileUploadScreem.png";
import '../Samples.scss';

export default class FileUploaderView extends Component {

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
        let FileExample = " <FileUploader\n         category = 'uploaded_files'\n         name = 'fileSampleId'\n         required ={true}\n         onChange ={this.handleFileChange}\n         label = 'CV'\n/> ";
        let adiuoExample = " <AudioUploader \n category='uploaded_audio' \n name='audioSampleId' \n required={false} \n onChange={this.handleFileChange} \n label='Choose your favorite song'\n/>"
        let ingExample = " <ImageUploader \n category='uploaded_images' \n  name='imageSampleId' \n required={false} \n onChange={this.handleFileChange}\n label='Show us your dog'\n multipleSizes=true \n maxSize={625}\n/>"
        let importFile = "import FileUploader from '/src/modules/fileshandler/client/components/FileUploader.js'\n"
        let importAdiuo = "import AudioUploader from '/src/modules/fileshandler/client/components/AudioUploader.js\n'"
        let importImage = "import ImageUploader from '/src/modules/samples/ImageUploaderView.js'\n"
        return (

            <div>
                <br /><br /><br />
                <div className="p-5" style={{ borderRadius: "10px", border: "1px grey solid", width: "84%", marginLeft: "8%", marginRight: "8%" }}>
                    <h2>File Uploader</h2>
                    <h3>Supported file's formats: pdf, doc, docx</h3>
                    <br />
                    <div style={{ borderStyle: "double", padding: "0.5vw" }}>
                        <FileUploader
                            category='uploaded_files' // file is saved into public/files/[category]
                            name='fileSampleId' // [FILE_NAME_LIKE_IN_DATABASE]
                            required={true}
                            onChange={this.handleFileChange}
                            label='CV'
                        />
                    </div>
                    <div className="" dir="ltr" style={{ textAlign: "left", whiteSpace: "pre-wrap", background: "#f0f0f0", width: "80%", marginLeft: "10%", marginRight: "10%" }}>
                        {importFile}<br />
                        {FileExample}
                    </div>
                    <div className="m-2 mt-4" dir='ltr'>
                        <table class="table table-bordered" style={{ textAlign: "left" }}>
                            <thead>
                                <tr>
                                    <th scope="col">#</th>
                                    <th scope="col">property</th>
                                    <th scope="col">type</th>
                                    <th scope="col">description</th>
                                    <th scope="col">default</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <th scope="row">1</th>
                                    <td>category</td>
                                    <td>String</td>
                                    <td>save file in '/public/files/[category]'</td>
                                    <td>-</td>
                                </tr>
                                <tr>
                                    <th scope="row">2</th>
                                    <td>name</td>
                                    <td>String</td>
                                    <td>Has to be <strong>uniqe</strong> to each uploader.<br />
                                        If the model we are POSTing to has a property with the same name as <em>name</em>:
                                        The uploaded file's id reference will be saved there. (Example for value: profileImgId)</td>
                                    <td>-</td>
                                </tr>
                                <tr>
                                    <th scope="row">3</th>
                                    <td>required</td>
                                    <td>boolean</td>
                                    <td>Is it required to fill the input or not</td>
                                    <td>-</td>
                                </tr>
                                <tr>
                                    <th scope="row">3</th>
                                    <td>onChange</td>
                                    <td>function</td>
                                    <td>Send onChange method to get the data from the fileUploader and use it for your uses</td>
                                    <td>-</td>
                                </tr>
                                <tr>
                                    <th scope="row">3</th>
                                    <td>label</td>
                                    <td>String</td>
                                    <td>Description of what the user will upload</td>
                                    <td>-</td>
                                </tr>
                            </tbody>
                        </table>
                        <br />

                    </div>
                    <img src={screenfile} style={{ width: "80%" }}></img>


                </div>

                <br /> <br /> <br />

                <div className="p-5" style={{ borderRadius: "10px", border: "1px grey solid", width: "84%", marginLeft: "8%", marginRight: "8%" }}>
                    <h2>Audio Uploader</h2>
                    <h3>Supported file's formats: mp3, wav, webm</h3>
                    <br />
                    <div style={{ borderStyle: "double", padding: "0.5vw" }}>
                        <AudioUploader
                            category='uploaded_audio' // audio is saved into public/files/[category]
                            name='audioSampleId' // [AUDIO_NAME_LIKE_IN_DATABASE]
                            required={false}
                            onChange={this.handleFileChange}
                            label='Choose your favorite song'
                        />
                    </div>
                    <div dir="ltr" style={{ textAlign: "left", whiteSpace: "pre-wrap", background: "#f0f0f0", width: "80%", marginLeft: "10%", marginRight: "10%" }}>
                        {importAdiuo}<br />

                        {adiuoExample}
                    </div>
                    <div className="m-2 mt-4" dir='ltr'>
                        <table class="table table-bordered" style={{ textAlign: "left" }}>
                            <thead>
                                <tr>
                                    <th scope="col">#</th>
                                    <th scope="col">Property</th>
                                    <th scope="col">Type</th>
                                    <th scope="col">Description</th>
                                    <th scope="col">Default</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <th scope="row">1</th>
                                    <td>category</td>
                                    <td>String</td>
                                    <td>Audio is saved into public/files/[category]</td>
                                    <td>-</td>
                                </tr>
                                <tr>
                                    <th scope="row">2</th>
                                    <td>name</td>
                                    <td>String</td>
                                    <td>Has to be <strong>uniqe</strong> to each uploader.<br />
                                        If the model we are POSTing to has a property with the same name as <em>name</em>:
                                        The uploaded audio's id reference will be saved there. (Example for value: profileImgId)</td>
                                    <td>-</td>
                                </tr>
                                <tr>
                                    <th scope="row">3</th>
                                    <td>required</td>
                                    <td>boolean</td>
                                    <td>Is it required to fill the input or not</td>
                                    <td>-</td>
                                </tr>
                                <tr>
                                    <th scope="row">4</th>
                                    <td>onChange</td>
                                    <td>function</td>
                                    <td>Send onChange method to get the data from the audioUploader and use it for your uses</td>
                                    <td>-</td>
                                </tr>
                                <tr>
                                    <th scope="row">5</th>
                                    <td>label</td>
                                    <td>String</td>
                                    <td>Description of what the user will upload</td>
                                    <td>-</td>
                                </tr>
                            </tbody>
                        </table>
                        <br />

                    </div>
                    <img src={screenfile} style={{ width: "80%" }}></img>

                </div>

                <br /> <br /> <br />

                <div className="p-5" style={{ borderRadius: "10px", border: "1px grey solid", width: "84%", marginLeft: "8%", marginRight: "8%" }}>
                    <h2>Image Uploader</h2>
                    <h3>Supported file's formats: jpg, png, jpeg, gif, svg</h3>
                    <br />
                    <div style={{ borderStyle: "double", padding: "0.5vw" }}>

                        <ImageUploader
                            category='uploaded_images' // image is saved into public/images/[category]
                            name='imageSampleId' // [IMAGE_NAME_LIKE_IN_DATABASE]
                            required={false}
                            onChange={this.handleFileChange}
                            label='Show us your dog'
                            multipleSizes={true}
                            checkImgMinSize={true}
                            checkImgMaxSize={true}
                        // defaultThumbnailImageSrc=[PATH_TO_YOUR_DEFAULT_IMAGE]//a path in public, example:'/images/mydefaultimg.png'
                        />
                    </div>
                    <div dir="ltr" style={{ textAlign: "left", whiteSpace: "pre-wrap", background: "#f0f0f0", width: "80%", marginLeft: "10%", marginRight: "10%" }}>
                        {importImage}<br />

                        {ingExample}
                    </div>
                    <div className="m-2 mt-4" dir='ltr'>
                        <table class="table table-bordered" style={{ textAlign: "left" }}>
                            <thead>
                                <tr>
                                    <th scope="col">#</th>
                                    <th scope="col">Property</th>
                                    <th scope="col">Type</th>
                                    <th scope="col">Description</th>
                                    <th scope="col">Default</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <th scope="row">1</th>
                                    <td>name</td>
                                    <td>String</td>
                                    <td>Has to be <strong>uniqe</strong> to each uploader.<br />
                                        If the model we are POSTing to has a property with the same name as <em>name</em>:
                                        The uploaded audio's id reference will be saved there. (Example for value: profileImgId)</td>
                                    <td>-</td>
                                </tr>
                                <tr>
                                    <th scope="row">2</th>
                                    <td>title</td>
                                    <td>String</td>
                                    <td>The image's title in database at Images model</td>
                                    <td>default_image_title</td>
                                </tr>
                                <tr>
                                    <th scope="row">3</th>
                                    <td>description</td>
                                    <td>String</td>
                                    <td>The image's description in database at Images model</td>
                                    <td>default_image_description</td>
                                </tr>
                                <tr>
                                    <th scope="row">4</th>
                                    <td>category</td>
                                    <td>String</td>
                                    <td>Image is saved into public/images/[category]</td>
                                    <td>default_image_category</td>
                                </tr>
                                <tr>
                                    <th scope="row">5</th>
                                    <td>label</td>
                                    <td>String</td>
                                    <td>Description of what you whant the user will upload</td>
                                    <td>Choose image</td>
                                </tr>
                                <tr>
                                    <th scope="row">6</th>
                                    <td>minSize</td>
                                    <td>int</td>
                                    <td>Minimum image's size in KB</td>
                                    <td>0</td>
                                </tr>
                                <tr>
                                    <th scope="row">7</th>
                                    <td>maxSize</td>
                                    <td>int</td>
                                    <td>Maximum image's size in KB</td>
                                    <td>5000</td>
                                </tr>
                                <tr>
                                    <th scope="row">8</th>
                                    <td>multipleSizes</td>
                                    <td>boolean</td>
                                    <td>If <em>true</em>, saves the image in 3 versions: small, medium and large.</td>
                                    <td>false</td>
                                </tr>
                                <tr>
                                    <th scope="row">9</th>
                                    <td>defaultThumbnailImageSrc</td>
                                    <td>String</td>
                                    <td>Image's path in public, example:'/images/myImage.png'</td>
                                    <td>src/modules/fileshandler/imgs/default-thumbnail.svg</td>
                                </tr>
                                <tr>
                                    <th scope="row">10</th>
                                    <td>removeFileIcon</td>
                                    <td>String</td>
                                    <td>Image's path in public, example:'/images/myImage.png</td>
                                    <td>src/modules/fileshandler/imgs/x-icon.png</td>
                                </tr>
                                <tr>
                                    <th scope="row">11</th>
                                    <td>theme</td>
                                    <td>react component which extends PreviewWidget
                                        (at /src/modules/fileshandler/client/components/preview-widget/PreviewWidget)</td>
                                    <td>If it is possible to change the input's value</td>
                                    <td>-</td>
                                </tr>
                                <tr>
                                    <th scope="row">12</th>
                                    <td>previewWidget</td>
                                    <td>PreviewWidget component OR react component which extends PreviewWidget
                                        (at /src/modules/fileshandler/client/components/PreviewWidget)</td>
                                    <td>When clicking on the image's thumbnail, the PreviewWidget will show as a popup.<br />
                                        The PreviewWidget components has a few props: enableEdit, enableDelete <br />
                                        Both are boolean, default false. Control the options of the user to edit/delete the image.</td>
                                    <td>-</td>
                                </tr>
                                <tr>
                                    <th scope="row">13</th>
                                    <td>required</td>
                                    <td>boolean</td>
                                    <td>Is it required to fill the input or not</td>
                                    <td>false</td>
                                </tr>
                                <tr>
                                    <th scope="row">14</th>
                                    <td>disabled</td>
                                    <td>boolean</td>
                                    <td>If it is possible to change the image's input's value</td>
                                    <td>false</td>
                                </tr>
                                <tr>
                                    <th scope="row">15</th>
                                    <td>onChange</td>
                                    <td>function</td>
                                    <td>Send onChange method to get the data from the imgUploader and use it for your uses</td>
                                    <td>-</td>
                                </tr>
                            </tbody>
                        </table>
                        <br />

                    </div>
                    <img src={screenImg} style={{ width: "80%" }}></img>
                </div>
                <br />

                <button style={{ backgroundColor: "#38c57b", borderRadius: "0.5vw", padding: "0.5vw", display: "inline-block" }} onClick={this.upload}>העלאה של קובץ</button>
                <br />
            </div>
        );
    }
}
