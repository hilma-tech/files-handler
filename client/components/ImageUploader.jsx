import React, { Component } from 'react';
import defaultThumbnailImage from './../../imgs/default-thumbnail-img.png';

export default class ImageUploader extends Component {

    constructor(props) {
        super(props);

        this.state = {
            thumbnailImageSrc: this.props.defaultThumbnailImageSrc == undefined ?
                defaultThumbnailImage :
                this.props.defaultThumbnailImageSrc
        };
        this.onChangeImg = this.onChangeImg.bind(this);
    }



    readFileToBase64 = (fileInfo) => {
        return new Promise((resolve, reject) => {
            if (fileInfo) {

                var FR = new FileReader();
                FR.addEventListener("load", function (e) {
                    resolve(e.target.result);
                });

                FR.readAsDataURL(fileInfo);
            }
            else reject("no file");
        })

    }


    async onChangeImg(e) {
        // console.log("Image has changed");
        let base64String = await this.readFileToBase64(e.target.files[0]);
        this.setState({ thumbnailImageSrc: base64String })

        let imageObj = {
            src: base64String,
            type: 'image',
            title: this.props.title || "default_image_title",
            category: this.props.category || "default_image_category"
        };

        let eventObj = { target: { name: this.props.name, value: imageObj } }
        this.props.onChange(eventObj);
    }



    render() {

        return (
            <div>
                <label>
                    <input
                        onChange={this.onChangeImg}
                        name="image"
                        required={this.props.required || false}
                        type="file"
                        accept=".png, .jpg, .jpeg, .gif"
                    />
                    <img
                        src={this.state.thumbnailImageSrc}
                        height="100px"
                        width="auto"
                        alt="uploading image"
                    />
                    <span>{this.props.label || "Upload Image"}</span>
                </label>
            </div>
        );
    }
}





// THE COMMENTED CODE IS BEING WORKED ON SO DONT TOUCH IT NOW
// IT IS IN THE MIDDLE OF MERGING WITH SHIRA AND CHANA EMUNA'S CODES
// IT TEACHNICALLY WORKS BUT NOT SO "NAGISH" TO USE PROPERLY IN YOUR CODE



// /**
//  * in this class you choose an image
//  * and prepare it to be uploaded
//  */

// import React, { Component } from 'react';
// import defaultThumbnailImage from './../imgs/default-thumbnail-img.png';
// import 'react-image-crop/dist/ReactCrop.css';
// import ImageCropper from "./ImageCropper.jsx";
// import Button from '@material-ui/core/Button';

// /***
//  * todo: 
// //  * resallution - display canvas smaller
// //  * what happens with circle??
//  * pop up called from butten or from function
//  * diffrentiate between image and cropper
//  */
// export default class ImageUploader extends Component {

//     constructor(props) {
//         super(props);
//         this.reactCropRef = React.createRef(); //the imported react-cropper library
//         this.imagePreviewCanvasRef = React.createRef(); // to create a new pictuere
//         this.state = {
//             thumbnailImageSrc: this.props.defaultThumbnailImageSrc ||
//                 defaultThumbnailImage
//         };
//     }



//     readFileToBase64 = (fileInfo) => {
//         return new Promise((resolve, reject) => {
//             if (fileInfo) {

//                 var FR = new FileReader();
//                 FR.addEventListener("load", function (e) {
//                     resolve(e.target.result);
//                 });

//                 FR.readAsDataURL(fileInfo);
//             }
//             else reject("no file");
//         })

//     }


//     onChangeImg = async (e) => {
//         let base64String = await this.readFileToBase64(e.target.files[0]);
//         this.setState({ thumbnailImageSrc: base64String })

//         let imageObj = {
//             src: base64String,
//             type: 'image',
//             title: 'title',
//             category: this.props.category
//         };

//         let eventObj = { target: { name: this.props.name, value: imageObj } }
//         this.props.onChange(eventObj);
//     }

//     onDownloadClick = (e) => {
//         e.preventDefault();
//         const base64Data = this.state.thumbnailImageSrc;
//         const canvasRef = this.imagePreviewCanvasRef.current;
//         const fileExtention = base64Data.substring("data:image/".length, base64Data.indexOf(";base64"))//example: png
//         const cropedBase64 = canvasRef.toDataURL("./image" + fileExtention);
//         const fileName = "previewFile." + fileExtention;
//         const cropedFile = this.base64StringtoFile(cropedBase64, fileName);
//         // downloading it: 
//         // console.log("image url: ", cropedBase64);
//         let element = document.createElement('a');
//         element.setAttribute('href', cropedBase64);
//         element.setAttribute('download', fileName);
//         element.style.display = 'none';
//         document.body.appendChild(element);
//         element.click();
//         document.body.removeChild(element);
//     }

//     base64StringtoFile = (base64String, filename) => {
//         var arr = base64String.split(','), mime = arr[0].match(/:(.*?);/)[1],
//             bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
//         while (n--) {
//             u8arr[n] = bstr.charCodeAt(n);
//         }
//         return new File([u8arr], filename, { type: mime });
//     }
//     editImgUrl = (url) => {
//         this.setState({ thumbnailImageSrc: url })
//     }
//     render() {
//         return (
//             <div className='image-uploader'>
//                 {(this.props.croppable ?
//                     <ImageCropper
//                         src={this.state.thumbnailImageSrc}
//                         proportion={this.props.proportion ? this.props.proportion : null}
//                         ellipse={this.props.ellipse}
//                         getCropUrl={(url) => this.editImgUrl(url)}
//                         cropper={{}}
//                     />
//                     :
//                     <img src={this.state.thumbnailImageSrc} height="100px" width="auto" alt="Avatar" className={this.props.defaultThumbnailClassName} onClick={this.openFileExplorer} />
//                 )}
//                 {/* <img
//                     src={this.state.thumbnailImageSrc}
//                     height="100px"
//                     width="auto"
//                     alt="uploading image"
//                     //className={this.props.defaultThumbnailClassName}
//                     onClick={this.openFileExplorer} /> */}
//                 <input
//                     //ref={this.imageRef}
//                     onChange={this.onChangeImg}
//                     name="image"
//                     required={this.props.required}
//                     type="file"
//                     accept=".png, .jpg, .jpeg, .gif"
//                 //id="file"
//                 //style={{ visibility: "hidden" }}
//                 />
//                 <label htmlFor="file">
//                     <Button
//                         variant="contained"
//                         color="secondary"
//                         component="span" className="">
//                         choose file
//                 </Button>
//                 </label>
//                 <Button
//                     variant="contained"
//                     color="secondary"
//                     component="span"
//                     onClick={this.onDownloadClick}
//                 >
//                     Download
//                 </Button>
//                 {/* <button onClick={this.onDownloadClick} > Download</button> */}
//             </div>);
//     }
// }
