export default class Consts {

    // MultiFilesHandler
    static FILE_MIN_SIZE = 100000; // bytes
    static FILE_MAX_SIZE = 10000000; //4090000 //130000000; //bytes

    // Supported file types
    static FILE_TYPE_FILE = "file";
    static FILE_TYPE_IMAGE = "image";
    static FILE_TYPE_VIDEO = "video";
    static FILE_TYPE_AUDIO = "audio";

    // Supported file extensions
    static FILE_EXTENSIONS_FILE = ["pdf", "doc", "docx"];
    static FILE_EXTENSIONS_IMAGE = ["png", "jpeg", "jpg", "gif", "svg"];
    static FILE_EXTENSIONS_VIDEO = ["mp3", "wav", "webm"];
    static FILE_EXTENSIONS_AUDIO = ["mp4", "ogg", "avi", "webm"];

    // Supported file types & extensions
    static FILE_TYPES_AND_EXTENSIONS = {
        [Consts.FILE_TYPE_FILE]: Consts.FILE_EXTENSIONS_FILE,
        [Consts.FILE_TYPE_IMAGE]: Consts.FILE_EXTENSIONS_IMAGE,
        [Consts.FILE_TYPE_VIDEO]: Consts.FILE_EXTENSIONS_VIDEO,
        [Consts.FILE_TYPE_AUDIO]: Consts.FILE_EXTENSIONS_AUDIO
    }

    // Folders names
    static FOLDERS = {
        [Consts.FILE_TYPE_FILE]: 'files',
        [Consts.FILE_TYPE_IMAGE]: 'imgs',
        [Consts.FILE_TYPE_VIDEO]: 'videos',
        [Consts.FILE_TYPE_AUDIO]: 'audios'
    };

    // Permissions
    static USER = 'USER';
    static ALLOW = 'ALLOW';

    // Files status
    static FILE_ACCEPTED = "accepted";
    static FILE_REJECTED = "rejected"

    static FILE_TYPES = {
        file: {
            pdf: 'application/pdf',
            doc: 'application/msword',
            docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        },
        image: {
            jpg: 'image/jpeg',
            png: 'image/png',
            jpeg: 'image/jpeg',
            gif: 'image/gif',
            svg: 'image/svg+xml'
        },
        audio: {
            mp3: 'audio/mp3',
            wav: 'audio/wav',
            webm: 'audio/webm'
        },
        video: {
            mp4: 'video/mp4',
            ogg: 'video/ogg',
            avi: 'video/avi',
            webm: 'video/webm'
        }
    }
}