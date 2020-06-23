import React, { Component } from 'react';
import Consts from '../../../consts/Consts.json';
import { fileshandler as config } from '../../../../../consts/ModulesConfig';
import FixImgOrientation from '../FixImgOrientation';
// import './SingleFileUploader.scss';

export default class SingleFileUploaderClass extends Component { // Should be react related?

    constructor(props) { // TODO: Remove state dependency
        super(props);

        this.initialValues(); // TODO: Convert to regular 
        let defaltPreviewObj = this.getDefaultFilePreviewObj();

        this.state = {
            fileData: { previewObj: defaltPreviewObj, acceptedObj: null }
        };

        this.onChange = this.onChange.bind(this); // Intentionally bind instead of arrow function
    }

    componentDidMount() {
        // In order to show the default chosen file, we "simulate" onChange function with the given file
        if (this.props.defaultChosenFile) {
            let file = this.props.defaultChosenFile;
            let e = { target: { files: [file] } };
            this.onChange(e, true, false);
        }
    }

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

        if (this.props.type === Consts.FILE_TYPE_FILE) { // TODO: Split dependency
            filePreview.preview = isDefaultChosenFile ? "Default file" : file.name;
            filePreview.extension = isDefaultChosenFile ? file.split(".").pop() : this.getExtension(file.type);
        }
        else filePreview.preview = base64String;

        return filePreview;
    }

    getDefaultFilePreviewObj = () => {
        return this.getFilePreviewObj(null, this.defaultTumbnail, Consts.DEFAULT_THUMBNAIL);
    }

    initialValues = () => {
        this.defaultTumbnail = this.getDefaultThumbnail();

        this.minSizeInKB = this.props.minSizeInKB && this.props.minSizeInKB > config.FILE_SIZE_RANGE_IN_KB[this.props.type].MIN_SIZE ?
            this.props.minSizeInKB : config.FILE_SIZE_RANGE_IN_KB[this.props.type].MIN_SIZE;

        this.maxSizeInKB = this.props.maxSizeInKB && this.props.maxSizeInKB < config.FILE_SIZE_RANGE_IN_KB[this.props.type].MAX_SIZE ?
            this.props.maxSizeInKB : config.FILE_SIZE_RANGE_IN_KB[this.props.type].MAX_SIZE;
    }

    getDefaultThumbnail = () => {
        // Suppport previous versions
        let propsDefaultTumbnail = this.props.defaultValue || this.props.thumbnail || this.props.defaultThumbnailImageSrc;
        let defaultThumbnail = propsDefaultTumbnail || require(`../../../imgs/fileThumbnails/upload-file-thumbnail.svg`);
        return defaultThumbnail;
    }

    getExtension = (mime) => {
        let extensions = Consts.FILE_EXTENSIONS[this.props.type];
        for (let extension of extensions) {
            let mimeOrMimes = Consts.FILE_MIMES[extension];
            if (Array.isArray(mimeOrMimes)) {
                if (mimeOrMimes.includes(mime)) return extension;
                continue;
            }
            if (mimeOrMimes === mime) return extension;
        }
        return null;
    }

    async onChange(e, isDefaultChosenFile = false, readFileToBase64 = true, cb = () => { }) {
        if (!e.target || !e.target.files || !e.target.files[0]) return;
        let file = e.target.files[0];

        let base64String = null;
        let fileObj = null;
        let filePreview = null;

        // !NOTICE: When defaultChosenFile=true, the file is automatically accepted
        let [status, errMsg] = this.isFileInSizeRange(file, isDefaultChosenFile);

        if (config.SHRINK_LARGE_IMAGE_TO_MAX_SIZE || status === Consts.FILE_ACCEPTED) { // TODO: Only relevant to image, check SHRINK_LARGE_IMAGE_TO_MAX_SIZE=true

            if (!readFileToBase64) {
                if (file && file.file) base64String = file.file;
                else base64String = file;
            }
            else {
                //if image => get base64 of image on canvas with orientation 1 
                if (this.props.type === Consts.FILE_TYPE_IMAGE) base64String = await FixImgOrientation.resetOrientation(file);
                //if audio/file => get base64 
                else base64String = await this.readFileToBase64(file);
            }
            if (this.props.type === Consts.FILE_TYPE_IMAGE && errMsg === Consts.ERROR_MSG_FILE_TOO_BIG) { // TODO: Fix condition
                //resize the image to smaller size and don't show the error message
                errMsg = null;
                status = Consts.FILE_ACCEPTED;
                base64String = await this.resizeLargeImage(file, base64String);
            }

            fileObj = {
                src: base64String,
                type: this.props.type,
                title: this.props.title || "default_title",
                category: this.props.category || "default_category",
                description: this.props.description || "default_description"
            };

            filePreview = this.getFilePreviewObj(file, base64String, status, errMsg, isDefaultChosenFile);
        }

        else { // status = Consts.FILE_REJECTED

            if (this.props.isErrorPopup)
                filePreview = this.getFilePreviewObj(null, this.defaultTumbnail, status, errMsg);
            else {
                if (this.props.type !== Consts.FILE_TYPE_FILE) {
                    if (!readFileToBase64) {
                        if (file && file.file) base64String = file.file;
                        else base64String = file;
                    }
                    else {
                        //if image => get base64 of image on canvas with orientation 1 
                        if (this.props.type === Consts.FILE_TYPE_IMAGE) {
                            base64String = await FixImgOrientation.resetOrientation(file)
                        }
                        //if audio/file => get base64 
                        else base64String = await this.readFileToBase64(file);
                    }
                }

                filePreview = this.getFilePreviewObj(file, base64String, status, errMsg);
            }
        }

        let fileData = { previewObj: filePreview, acceptedObj: fileObj }; // TODO: this.fileData = fileData
        this.setState({ fileData },
            () => cb(fileData, isDefaultChosenFile));
    }

    isFileInSizeRange = (file, isDefaultChosenFile = false) => {
        let status = Consts.FILE_ACCEPTED;
        let errMsg = null;

        if (isDefaultChosenFile) return [status, errMsg];

        let sizeKB = file.size * 0.001;
        if (sizeKB < this.minSizeInKB) {
            status = Consts.FILE_REJECTED;
            errMsg = Consts.ERROR_MSG_FILE_TOO_SMALL;
        }
        if (sizeKB > this.maxSizeInKB) {
            status = Consts.FILE_REJECTED;
            errMsg = Consts.ERROR_MSG_FILE_TOO_BIG;
        }

        return [status, errMsg];
    }

    readFileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            if (file) {
                var FR = new FileReader();
                FR.addEventListener("load", function (e) {
                    resolve(e.target.result);
                });

                FR.readAsDataURL(file);
            }
            else reject("ERROR: No file accepted");
        })
    }

    //resize large image to the large size given in config.IMAGE_SIZES_IN_PX
    resizeLargeImage = (file, base64) => {
        return new Promise((resolve, reject) => {
            const maxWidth = config.IMAGE_SIZES_IN_PX['l'] ? config.IMAGE_SIZES_IN_PX['l'] : 1000;

            const maxHeight = 500;
            var canvas = document.createElement("canvas");
            var ctx = canvas.getContext("2d");
            var canvasCopy = document.createElement("canvas");
            var copyContext = canvasCopy.getContext("2d");

            // Create original image
            var img = new Image();
            img.src = base64;
            img.onload = function () {
                // Determine new ratio based on max size
                var ratio = 1;
                if (img.width > maxWidth)
                    ratio = maxWidth / img.width;
                else if (img.height > maxHeight)
                    ratio = maxHeight / img.height;

                // Draw original image in second canvas
                canvasCopy.width = img.width;
                canvasCopy.height = img.height;
                copyContext.drawImage(img, 0, 0);

                // Copy and resize second canvas to first canvas
                //the first canvas has smaller width and height than the original image
                canvas.width = img.width * ratio;
                canvas.height = img.height * ratio;

                ctx.drawImage(canvasCopy, 0, 0, canvasCopy.width, canvasCopy.height, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL(file.type));
                reject(base64);
            };
        });
    }

    removeFile = (cb = () => { }) => {
        if (this.state.fileData.previewObj.state === Consts.DEFAULT_THUMBNAIL) return;
        let defaltPreviewObj = this.getDefaultFilePreviewObj();
        let fileData = { previewObj: defaltPreviewObj, acceptedObj: null };
        this.setState({ fileData },
            () => cb(fileData));
    }

    render() {
        let data = {
            fileData: this.state.fileData,
            onChange: this.onChange,
            removeFile: this.removeFile
        }
        return this.props.children(data);
    }
}