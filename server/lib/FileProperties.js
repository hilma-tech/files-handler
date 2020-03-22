const path = require('path');
const fs = require('fs');
const Consts = require('../../consts/Consts.json');
const logFile = require('debug')('model:file');

module.exports = class FileProperties {

    static getSaveDir(type) {
        logFile("type", type)
        try {
            //also on production we save into public (and not to build because the file can get delete from 'build')
            const baseFileDirPath = '../../../../../public';
            const saveDir = path.join(__dirname, `${baseFileDirPath}/${Consts.FOLDERS[type]}/`);
            if (!fs.existsSync(saveDir)) {//create dir if dosent exist.
                fs.mkdirSync(saveDir, { recursive: true });
                logFile("New folder was created ", saveDir);
            }
            return saveDir;
        } catch (err) {
            logFile("Err creating a base folder for our files :(", err);
            return;
        }
    }
    
    static getRegex(extension) {
        switch (extension) {
            case 'pdf':
                return /^data:application+\/pdf?;base64,/;
            case 'doc':
                return /^data:application+\/msword?;base64,/;
            case 'docx':
                return /^data:application+\/vnd.openxmlformats-officedocument.wordprocessingml.document?;base64,/;
            case 'png':
                return /^data:image+\/png?;base64,/;
            case 'jpeg':
                return /^data:image+\/jpeg?;base64,/;
            case 'gif':
                return /^data:image+\/gif?;base64,/;
            case 'svg':
                return /^data:image+\/svg+\++\xml;base64,?/;
            case 'mp3':
                return /^data:audio+\/mp3?;base64,/;
            case 'wav':
                return /^data:audio+\/wav?;base64,/;
            case 'webm':
                return /^data:(video|audio)\/[a-zA-Z0-9?><;,{}[\]\-_+=!@#$%\^&*|']+;base64,/;
            case 'mp4':
                return /^data:video+\/mp4?;base64,/;
            case 'ogg':
                return /^data:video+\/ogg?;base64,/;
            case 'avi':
                return /^data:video+\/avi?;base64,/;
            default:
                return null;
        }
    }
    
    static getFileExtension(fileSrc, fileType) {
        let mimeType = this.base64MimeType(fileSrc);
        logFile("Base64 mimeType of file", mimeType);
        if (!mimeType) return null;
    
        let extensionsAndMimesOfType = Consts.FILE_TYPES_AND_EXTENSIONS_AND_MIMES[fileType];
        let extensions = Object.keys(extensionsAndMimesOfType);
        let extension = extensions.find(extension => extensionsAndMimesOfType[extension] === mimeType);
        if (extension === 'jpg') extension = 'jpeg'; // necessary
        return extension;
    }

    static base64MimeType(encodedString) {
        if (typeof encodedString !== 'string') return null;
    
        var mime = encodedString.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
        if (mime && mime.length) return mime[1];
        return null;
    }
    
    static base64FileSizeInKB(encodedString) {
        if (typeof encodedString !== 'string') return null;
    
        let length = encodedString.length;
        let twoLastChars = encodedString.slice(length - 2, length);
        let count = 0;
        for (let char in twoLastChars) if (char === "=") count++;
        let sizeInBytes = (3 * (length / 4)) - count;
        let sizeInKB = sizeInBytes / 1000;
    
        return sizeInKB;
    }

    static async isFileSizeInRange(file) {
        let extension = this.getFileExtension(file.src, file.type);
        if (!extension) return false;
        let regex = this.getRegex(extension);
        if (!regex) return false;
    
        let sizeKB = this.base64FileSizeInKB(file.src);
    
        if (sizeKB < Consts.FILE_SIZE_RANGE_IN_KB[file.type].MIN_SIZE) {
            logFile("ERROR: File is too small");
            return false;
        }
    
        if (sizeKB > Consts.FILE_SIZE_RANGE_IN_KB[file.type].MAX_SIZE) {
            logFile("ERROR: File is too big");
            return false;
        }
        return true;
    }
}
