import SingleFileUploader from './single-file-uploader/SingleFileUploader';
import Consts from '../../consts/Consts.json';

export default class FileUploader extends SingleFileUploader {

    constructor(props) {
        props = {...props};
        props.type = Consts.FILE_TYPE_FILE;
        super(props);
    }
}
