import React from 'react';
import SingleFileUploader from './single-file-uploader/SingleFileUploader';
import Consts from '../../consts/Consts.json';

export default function FileUploader(props) {
    return (
        <>
            <SingleFileUploader
                type={Consts.FILE_TYPE_VIDEO}
                {...props}
            />
        </>
    );
}