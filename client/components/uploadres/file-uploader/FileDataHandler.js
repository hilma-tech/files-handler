import Consts from '../../../../consts/Consts.json';
import SingleFileDataHandler from '../../single-file-uploader/SingleFileDataHandler';

export default class FileDataHandler extends SingleFileDataHandler {

    getFilePreviewObj = (file = null, base64String = null, status, errMsg = null, isDefaultChosenFile = false) => {
        let isDefaultPreview = status === Consts.DEFAULT_THUMBNAIL ||
            (status === Consts.FILE_REJECTED && this.props.isErrorPopup);

        let filePreview = {
            preview: base64String,
            extension: null,
            status: status,
            errMsg: errMsg
        };

        if (isDefaultPreview) return filePreview;
        if (isDefaultChosenFile) {
            filePreview.preview = "Default file";
            filePreview.extension = file.split(".").pop();       
        }
        else {
            filePreview.preview = file.name;
            filePreview.extension = this.getExtension(file.type);    
        }
        return filePreview;
    }
}