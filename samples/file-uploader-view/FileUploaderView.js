import React, { Component } from 'react';
import Auth from '../../../auth/Auth'
import FileUploader from '../../client/components/FileUploader';
import AudioUploader from '../../client/components/AudioUploader';
import ImageUploader from '../../client/components/ImageUploader';
import { renderToString } from 'react-dom/server'
//import { UnControlled as CodeMirror } from 'react-codemirror2'
import screenImg from "./screenShotImages.png"
import screenfile from "./fileUploadScreem.png"

//import './sample.scss'
// import jsxToString from 'jsx-to-string';

export default class FileUploaderView extends Component {

    constructor(props) {
        super(props);
        this.state = {};
        this.STRING = ""
    }

    handleFileChange = (fileEvent) => {
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

    // componentDidMount() {

    // return this.STRING = renderToString(<FileUploader
    //     category='uploaded_files' // file is saved into public/files/[category]
    //     name='fileSampleId' // [FILE_NAME_LIKE_IN_DATABASE]
    //     required={true}
    //     onChange={this.handleFileChange}
    //     label='קורות חיים'
    // />)

    // }


    render() {
        let FileExample = " <FileUploader\n         category = 'uploaded_files'\n         name = 'fileSampleId'\n         required ={true}\n         onChange ={this.handleFileChange}\n         label = 'קורות חיים'\n/> ";
        let adiuoExample = " <AudioUploader \n category='uploaded_audio' \n name='audioSampleId' \n required={false} \n onChange={this.handleFileChange} \n label='Choose ur favorite song'\n/>"
        let ingExample = " <ImageUploader \n category='uploaded_images' \n  name='imageSampleId' \n required={false} \n onChange={this.handleFileChange}\n label='Show us your dog'\n/>"
        let importFile="import FileUploader from '/src/modules/fileshandler/client/components/FileUploader.js'\n"
        let importAdiuo="import AudioUploader from '/src/modules/fileshandler/client/components/AudioUploader.js\n'"
        let importImage="import ImageUploader from '/src/modules/samples/ImageUploaderView.js'\n"
        return (

            <div >
                <br /><br /><br />
                <div className="p-5" style={{ borderRadius: "10px", border: "1px grey solid", width: "84%", marginLeft: "8%", marginRight: "8%" }}>
                    <h2>העלאת קבצים </h2>
                    <h3>סוגי קבצים שניתן להעלות pdf, doc, docx </h3>
                    <h3 className="m-1">דוגמא</h3>
                    <div style={{ borderStyle: "double", padding: "0.5vw" }}>
                        <FileUploader
                            category='uploaded_files' // file is saved into public/files/[category]
                            name='fileSampleId' // [FILE_NAME_LIKE_IN_DATABASE]
                            required={true}
                            onChange={this.handleFileChange}
                            label='קורות חיים'
                        />
                    </div>
                    <div className="" dir="ltr" style={{ textAlign: "left", whiteSpace: "pre-wrap", background: "#f0f0f0", width: "80%", marginLeft: "10%", marginRight: "10%" }}>
                     {importFile}<br/>
                        {FileExample}
                    </div>
                    <div className="m-2 mt-4" dir='ltr'>
                        {/* <h3 className="mb-2">Properties:</h3> */}
                        <table class="table table-bordered" style={{textAlign: "left"}}>
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
                                    <td>The file will be saved in sql in a colum named "title" in Files</td>
                                    {/* <td>the file obj will be save in this 'name'
                                        can be- "fileId" (or another name like in your database) </td> */}
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
                    <img src={screenfile} style={{width:"80%"}}></img>


                </div>

                <br /> <br /> <br />

                <div className="p-5" style={{ borderRadius: "10px", border: "1px grey solid", width: "84%", marginLeft: "8%", marginRight: "8%" }}>
                    <h2>העלאת אודיו </h2>
                    <h3>סוגי קבצים שניתן להעלות mp3, wav </h3>
                    <h3>דוגמא</h3>
                    <div style={{ borderStyle: "double", padding: "0.5vw" }}>
                        <AudioUploader
                            category='uploaded_audio' // audio is saved into public/files/[category]
                            name='audioSampleId' // [AUDIO_NAME_LIKE_IN_DATABASE]
                            required={false}
                            onChange={this.handleFileChange}
                            label='תבחר את השיר אהוב עלייך'
                        />
                    </div>
                    <div dir="ltr" style={{ textAlign: "left", whiteSpace: "pre-wrap", background: "#f0f0f0", width: "80%", marginLeft: "10%", marginRight: "10%" }}>
                    {importAdiuo}<br/>

                        {adiuoExample}
                    </div>
                    <div className="m-2 mt-4" dir='ltr'>
                        {/* <h3 className="mb-2">Properties:</h3> */}
                        <table class="table table-bordered" style={{textAlign: "left"}}>
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
                                    <td>The audio will be saved in sql in a colum named "title" in Files </td>
                                    {/* <td>the file obj will be save in this 'name'
                                        can be- "fileId" (or another name like in your database) </td> */}
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
                    <img src={screenfile} style={{width:"80%"}}></img>

                </div>

                <br /> <br /> <br />

                <div className="p-5" style={{ borderRadius: "10px", border: "1px grey solid", width: "84%", marginLeft: "8%", marginRight: "8%" }}>
                    <h2>העלאת תמונה </h2>
                    <h3>סוגי קבצים שניתן להעלות .png, .jpg, .jpeg, .gif </h3>
                    <div style={{ borderStyle: "double", padding: "0.5vw" }}>

                        <ImageUploader
                            category='uploaded_images' // image is saved into public/images/[category]
                            name='imageSampleId' // [IMAGE_NAME_LIKE_IN_DATABASE]
                            required={false}
                            onChange={this.handleFileChange}
                            label='תראה לנו את הכלב שלך'
                        // defaultThumbnailImageSrc=[PATH_TO_YOUR_DEFAULT_IMAGE]//a path in public, example:'/images/mydefaultimg.png'
                        />
                    </div>
                    <div dir="ltr" style={{ textAlign: "left", whiteSpace: "pre-wrap", background: "#f0f0f0", width: "80%", marginLeft: "10%", marginRight: "10%" }}>
                    {importImage}<br/>

                        {ingExample}
                    </div>
                    <div className="m-2 mt-4" dir='ltr'>
                        {/* <h3 className="mb-2">Properties:</h3> */}
                        <table class="table table-bordered" style={{textAlign: "left"}}>
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
                                    <td>Image is saved into public/images/[category]</td>
                                    <td>-</td>
                                </tr>
                                <tr>
                                    <th scope="row">2</th>
                                    <td>name</td>
                                    <td>String</td>
                                    <td>The image will be saved in sql in a colum named "title" in Images  </td>
                                    {/* <td>the file obj will be saved in this 'name'
                                        can be- "fileId" (or another name like in your database) </td> */}
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
                                    <td>Send onChange method to get the data from the imgUploader and use it for your uses</td>
                                    <td>-</td>
                                </tr>
                                <tr>
                                    <th scope="row">5</th>
                                    <td>label</td>
                                    <td>String</td>
                                    <td>Description of what you whant the user will upload</td>
                                    <td>-</td>
                                </tr>
                                <tr>
                                    <th scope="row">6</th>
                                    <td>defaultThumbnailImageSrc</td>
                                    <td>String</td>
                                    <td>[PATH_TO_YOUR_DEFAULT_IMAGE] a path in public, example:'/images/mydefaultimg.png'</td>
                                    <td>-</td>
                                </tr>
                            </tbody>
                        </table>
                        <br />
                      
                    </div>
                    <img src={screenImg} style={{width:"80%"}}></img>
                </div>


                <button style={{ backgroundColor: "#38c57b", borderRadius: "0.5vw", padding: "0.5vw", display: "inline-block" }} onClick={this.upload}>העלאה של קובץ</button>
            </div >
        );
    }
}
























// import React, { Component } from 'react';
// import Auth from './../aut``h/Auth';
// import FileUploader  from './../fileshandler/client/components/FileUploader';
// import AudioUploader from './../fileshandler/client/components/AudioUploader';
// import ImageUploader from './../fileshandler/client/components/ImageUploader';
// import {UnControlled as CodeMirror} from 'react-codemirror2';
// //require('codemirror/mode/javascript/javascript');
// export default class FileUploaderView extends Component {

//     constructor(props) {
//         super(props);
//         this.state = {};
//        // this.char="{",
//        // this.charEnd="}"
//     }

//     handleFileChange = (fileEvent) => {
//         let name = (fileEvent.target && fileEvent.target.name) || null;
//         let value = (fileEvent.target && fileEvent.target.value) || null;
//         if (name && value) {
//             this.setState({ [name]: value });
//         }
//     }

//     getFilesData = () => {
//         const fieldsToSave = ['fileSampleId', 'audioSampleId', 'imageSampleId'];

//         let fieldsToSaveObj = {};
//         for (let field of fieldsToSave) {
//             fieldsToSaveObj[field] = this.state[field];
//         }

//         return fieldsToSaveObj;
//     }

//     upload = () => {
//         let filesData = this.getFilesData();

//         console.log("about to upload files YAYYYAY:)", filesData)
//         Auth.superAuthFetch('/api/Files', {
//             method: 'POST',
//             headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
//             body: JSON.stringify(filesData)
//         })
//     };
//     showT =()=>{
//     text="<AudioUploader"+
//         "category='uploaded_audio' // audio is saved into public/files/[category]"+
//         "name='audioSampleId' // [AUDIO_NAME_LIKE_IN_DATABASE]"+
//         "required={false}"+
//         "onChange={this.handleFileChange}"+
//         "label='Choose ur favorite song'"+
//     +"/>"

//     return <div>text<div></div></div>
//         var text = document.createTextNode({data:'<p>Stuff</p>'});
//         document.body.appendChild(text);
//     }
//     creatCodeMirror= ()=>{
//        let upload= <AudioUploader
//        category='uploaded_audio' // audio is saved into public/files/[category]
//        name='audioSampleId' // [AUDIO_NAME_LIKE_IN_DATABASE]
//        required={false}
//        onChange={this.handleFileChange}
//        label='Choose ur favorite song'
//    />



// //        let ree= "  AudioUploader"+
// //       " category='uploaded_audio' &#47;&#47; audio is saved into public/files/[category]"+
// //        "name='audioSampleId' &#47;&#47; [AUDIO_NAME_LIKE_IN_DATABASE]"+
// //        "required= &rbrace; false &#125;" +
// //        "onChange= &rbrace; this.handleFileChange &#125;"+
// //        "label='Choose ur favorite song'"+
// //    "/&gt;"
// //   return ree
//    }

//     render() {
//         this.creatCodeMirror();
//         return (

//             <div>
//                 {/* <script src="https://cdn.rawgit.com/google/code-prettify/master/loader/run_prettify.js"></script> */}

//                 <br /><br /><br />
//                 <div id="hey">UPLOAD FILE --> pdf, doc, docx</div>
//                 <FileUploader
//                     category='uploaded_files' // file is saved into public/files/[category]
//                     name='fileSampleId' // [FILE_NAME_LIKE_IN_DATABASE]
//                     required={true}
//                     onChange={this.handleFileChange}
//                     label='קורות חיים'
//                 />

//                 <br /><br /><br />
//                 <div>
//                 <div>UPLOAD AUDIO --> mp3, wav</div>

//                 <AudioUploader
//                     category='uploaded_audio' // audio is saved into public/files/[category]
//                     name='audioSampleId' // [AUDIO_NAME_LIKE_IN_DATABASE]
//                     required={false}
//                     onChange={this.handleFileChange}
//                     label='Choose ur favorite song'
//                 />
//                 </div>
//                 <br /><br /><br />
//                 <div>UPLOAD IMAGE --> .png, .jpg, .jpeg, .gif</div>

//               <p>
//              {/* {this.showT} */}

//               </p>
//             <div>{this.creatCodeMirror}</div>
//               <div id="toCopyFile">
//                 <ImageUploader
//                     category='uploaded_images' // image is saved into public/images/[category]
//                     name='imageSampleId' // [IMAGE_NAME_LIKE_IN_DATABASE]
//                     required={false}
//                     onChange={this.handleFileChange}
//                     label='Show us your dog'
//                     // defaultThumbnailImageSrc=[PATH_TO_YOUR_DEFAULT_IMAGE]//a path in public, example:'/images/mydefaultimg.png'
//                 />


//                 <button onClick={this.upload}>SUBMIT FILES</button>

//                 </div>
//             </div>
//         );
//     }
// }

