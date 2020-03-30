import SingleFileUploader from './single-file-uploader/SingleFileUploader';
import Consts from '../../consts/Consts.json';

export default class VideoUploader extends SingleFileUploader {

    constructor(props) {
        props = {...props};
        props.type = Consts.FILE_TYPE_VIDEO;
        super(props);
    }
}
