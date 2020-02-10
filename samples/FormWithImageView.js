/*
Features for future development:

/basefiles.json - notice that we have explicitly set up "mixins":{"fileshander":true}, in order to
"Games" model to work - we need to set it up...


(0)

Apply a simple form for games model - this view


(1)

** High Priorty - option to replace current images/files

** High Priorty - option to delete current images/files

+ ACL there's no option to make a file/image as widely open to public. (Shira knowns al ma medubar)


** Medium Priorty - option to change default image placeholder, + advances options to play around the design

(2)

** Ken High Priority - Integration with Video Uploader as soon as possible
Because it is already being applied and grows each day (Zehava)

(3) 
** Instead of implementing a simple form, we need to implement FormGenerator,
By doing so, we will provide a full sample how to use FormGenerator with examples so that ALL the girls
will be able to use it. (Not high priority)


*/

import React, { Component } from 'react';
import Auth from '../../auth/Auth';
import Styles from './Samples.scss';
import ImageUploader from './../client/components/ImageUploader';

const UploadedImage=(props)=>{
    return(
        <div className='figure-container'>
            <figure className='uploaded-figure'>
                <img src={props.path} alt={props.title} title={props.title} />
                <figcaption>{props.description}</figcaption>
            </figure>
        </div>
    );
}


export default class FormWithImageView extends Component {

    constructor(props) {
        super(props);
        this.state = {uploadedImage:null};
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

    upload = async () => {
        let filesData = this.getFilesData();

        console.log("about to upload files YAYYYAY:)", filesData)
        await Auth.superAuthFetch('/api/Files', {
            method: 'POST',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify(filesData)
        });
        
        let filter="filter[order]=id DESC&filter[limit]=1";
        let [res,err]= await Auth.superAuthFetch('/api/Images?'+filter);

        console.log("RES?",res);
        this.setState({uploadedImage:res[0]});



    };

    render() {
        return (

            <div>
                <br /><br /><br />
                <form>

                <div>UPLOAD IMAGE --> .png, .jpg, .jpeg, .gif</div>

                <input type='' />
                
                <ImageUploader
                    category='uploaded_images' // image is saved into public/images/[category]
                    name='imageSampleId' // [IMAGE_NAME_LIKE_IN_DATABASE]
                    required={false}
                    onChange={this.handleFileChange}
                    label='Show us your dog'
                    // defaultThumbnailImageSrc=[PATH_TO_YOUR_DEFAULT_IMAGE]//a path in public, example:'/images/mydefaultimg.png'
                />


                <button onClick={this.upload}>SUBMIT FILES</button>

                </form>

                {this.state.uploadedImage && <UploadedImage {...this.state.uploadedImage} />}
                
            </div>
        );
    }
}

