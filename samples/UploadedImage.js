import React from 'react';

const UploadedImage = (props) => {
    let uploadedImage = props.multiplesizes && props.multiplesizes.length > 0 ?
        <div>
            {props.multiplesizes.map((path, i) =>
                <div key={i} className='figure-container'>
                    <figure>
                        <img src={path} alt={props.title} title={props.title} />
                    </figure>
                </div>)}
        </div>
        :
        <div className='figure-container'>
            <figure>
                <img src={props.path} alt={props.title} title={props.title} />
            </figure>
        </div>;

    return uploadedImage;
}

export default UploadedImage;