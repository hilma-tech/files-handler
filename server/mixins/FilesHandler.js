'use strict';
const path = require('path');
const to = (promise) => {
    return promise.then(data => {
        return [null, data];
    })
        .catch(err => [err]);
}

const fs = require('fs');
const FILE_TYPE_FILE = 'file';
const FILE_TYPE_IMAGE = 'image';
const FILE_TYPE_VIDEO = 'video';
const FILE_TYPE_AUDIO = 'audio';
const USER = 'USER';
const ALLOW = 'ALLOW';
const logFile = require('debug')('model:file');
const folders = {
    [FILE_TYPE_IMAGE]: 'imgs',
    [FILE_TYPE_FILE]: 'files',
    [FILE_TYPE_VIDEO]: 'videos',
    [FILE_TYPE_AUDIO]: 'audios'
};

module.exports = function FilesHandler(Model) {

    Model.deleteFile = async function (prevFileId, ModelToSave) {
        logFile("Model.deleteFile is launched now with prevFileId: ", prevFileId);

        let [prevFileErr, prevFileRes] = await to(ModelToSave.findOne({ where: { id: prevFileId } }));
        if (prevFileErr || !prevFileRes) { logFile("Error finding previous file path", prevFileErr); return null; }

        const isProd = process.env.NODE_ENV == 'production';
        const baseFileDirPath = isProd ? '../../../../../build' : '../../../../../public';
        let filePath = prevFileRes.path;
        if (!isProd) filePath = filePath.replace('http://localhost:8080', '');

        try {
            const fullFilePath = path.join(__dirname, `${baseFileDirPath}${filePath}`);
            const shortFilePath = fullFilePath.split('/');
            const fileName = shortFilePath[shortFilePath.length - 1];
            const fileId = fileName.split('.')[0];
            if (!fs.existsSync(fullFilePath)) return fileId;
            fs.unlinkSync(fullFilePath);
            logFile("File with path %s was successfully removed (deleted)", fullFilePath);
            return fileId;
        } catch (err) {
            logFile("Error deleting file", err);
            return null;
        }
    }

    Model.saveFile = async function (file, FileModel, ownerId = null, fileId = null) {

        logFile("Model.saveFile is launched with ownerId", ownerId);
        let saveDir = getSaveDir(file.type);
        if (!saveDir) return false;
        let extension = getFileExtension(file.src);
        logFile("extension", extension);
        if (!extension) return false;
        let regex = getRegex(extension);
        logFile("regex", regex);
        if (!regex) return false;
        let base64Data = file.src.replace(regex, ''); // regex = /^data:[a-z]+\/[a-z]+\d?;base64,/
        logFile("\nownerId", ownerId);
        let fileObj = {
            category: file.category ? file.category : 'uploaded',
            owner: ownerId,
            format: extension,
            created: Date.now(),
            dontSave: true,// dont let afterSave remote do anything- needed?
            title: file.title,
            description: file.description
        };

        logFile("fileObj before save", fileObj);

        // If we are posting to and from the same model,
        // the instance was already created in the remote so we just update it 
        if (/*Model === FileModel && */fileId !== null)
            fileObj.id = fileId;
        logFile("fileObj before save", fileObj);

        let specificSaveDir = saveDir + fileObj.category + "/";
        let [err, newFile] = await to(FileModel.upsert(fileObj));

        if (err) { console.error("Error creating file, aborting...", err); return false }
        logFile("New entry created for model ", file.type, newFile);

        let fileTargetPath = null;

        try {
            if (!fs.existsSync(specificSaveDir)) {//create dir if dosent exist.
                fs.mkdirSync(specificSaveDir, { recursive: true });
                logFile("New folder was created ", specificSaveDir);
            }

            fileTargetPath = specificSaveDir + newFile.id + "." + extension;
            fs.writeFileSync(fileTargetPath, base64Data, 'base64');
        } catch (err) {
            logFile("Err", err);
        }

        logFile("New file was created of type (%s) on path (%s)", file.type, fileTargetPath);
        logFile("New file id", newFile.id)
        return newFile.id;
    }

    Model.beforeRemote('*', function (ctx, modelInstance, next) {

        logFile("Model.beforeRemote is launched", ctx.req.method);
        if (ctx.req.method !== "POST" && ctx.req.method !== "PUT" && ctx.req.method !== "PATCH"/* && !modelInstance.id*/)
            return next()

        let args = ctx.args;
        let data, field, key;

        (async () => {
            const argsKeys = Object.keys(args);

            for (let i = 0; i < argsKeys.length; i++) { // we are not using map func, because we cannot put async inside it.
                field = argsKeys[i];
                if (field === "options") continue;
                data = args[field];
                if (typeof data !== "object" || !data || Array.isArray(data)) continue;
                const dataKeys = Object.keys(data);

                for (let j = 0; j < dataKeys.length; j++) { // we are not using map func, because we cannot put async inside it.
                    key = dataKeys[j];
                    if (typeof data[key] !== "object" || !data[key] || !(data[key].src && data[key].type)) continue;

                    let filesToSave = ctx.args[field].filesToSave || {};
                    filesToSave[key] = data[key];
                    ctx.args[field]["filesToSave"] = filesToSave;
                    ctx.args[field][key] = null;
                };
            }
            return next();
        })();
    });

    Model.afterRemote('*', function (ctx, modelInstance, next) {
        logFile("Model.afterRemote(*) is launched", ctx.req.method);
        if (ctx.req.method !== "POST" && ctx.req.method !== "PUT" && ctx.req.method !== "PATCH" /*&& !modelInstance.id*/)
            return next();

        let fileOwnerId = (ctx.args.options && ctx.args.options.accessToken) ?
            ctx.args.options.accessToken.userId : //if there's accessToken use userId
            (Model === Model.app.models.CustomUser ? //else, if we are creating new user use new user's id
                (modelInstance && modelInstance.id) :
                null);

        logFile("The owner of the file is fileOwnerId", fileOwnerId);
        //Access is always restricted without authentication
        if (!fileOwnerId) { logFile("No owner for this file, aborting..."); return next(); }

        let args = ctx.args;

        (async () => {
            const argsKeys = Object.keys(args);

            for (let i = 0; i < argsKeys.length; i++) { // we are not using map func, because we cannot put async inside it.

                let field = argsKeys[i];
                logFile("Iterating with field (%s)", field);

                if (field === "options") continue;
                if (!args[field] || !args[field].filesToSave) return next();
                let filesToSave = args[field].filesToSave;

                for (let fileKey in filesToSave) {

                    const file = filesToSave[fileKey];
                    if (typeof file !== "object") continue;
                    let ModelToSave = null;
                    let ModelToSaveName = null;
                    switch (file.type) {
                        case FILE_TYPE_IMAGE:
                            ModelToSave = Model.app.models.Images;
                            ModelToSaveName = `${FILE_TYPE_IMAGE}s`;
                            break;
                        case FILE_TYPE_FILE:
                            ModelToSave = Model.app.models.Files;
                            ModelToSaveName = `${FILE_TYPE_FILE}s`;
                            break;
                        case FILE_TYPE_VIDEO:
                            ModelToSave = Model.app.models.Video;
                            ModelToSaveName = `${FILE_TYPE_VIDEO}s`;
                            break;
                        // TODO Shira ? - add Audio model and a case for it ?
                        case FILE_TYPE_AUDIO:
                            ModelToSave = Model.app.models.Audio;
                            ModelToSaveName = `${FILE_TYPE_AUDIO}s`;
                            break;
                        default: continue;
                    }

                    logFile("ModelToSave - Should be either Images/Files/Video", ModelToSaveName);

                    // If we are posting to and from the same model more than 1 file.. 
                    // Example: posting from Files (table) to Files (table) 2 files
                    let index = Object.keys(filesToSave).indexOf(fileKey);
                    let oldFileId = null;
                    if (index === 0 && Model === ModelToSave) oldFileId = modelInstance.id;

                    if (modelInstance[fileKey] && modelInstance[fileKey] !== {}) oldFileId = await Model.deleteFile(modelInstance[fileKey], ModelToSave);
                    logFile("FileId right before saveFile is launched is", oldFileId);

                    let newFileId = await Model.saveFile(file, ModelToSave, fileOwnerId, oldFileId);
                    if (!newFileId) { logFile("Couldn't create your file dude, aborting..."); continue; }

                    // If [fileKey] doesnt exist in Model then dont upsert
                    let [findErr, findRes] = await to(Model.findOne({ where: { id: modelInstance.id } }));
                    if (findErr || !findRes) { logFile("Error finding field, aborting...", findErr); continue; }

                    if (typeof findRes !== 'object') continue;
                    let findResKeys = (findRes && findRes.__data) ? Object.keys(findRes.__data) : Object.keys(findRes);
                    if (!findResKeys) continue;
                    if (!findResKeys.includes(fileKey)) { logFile(`The field "${fileKey}" doesnt exist in model, skipping upsert to that field...`); }
                    else {
                        // Updating the row to include the id of the file added
                        let [upsertErr, upsertRes] = await to(Model.upsertWithWhere(
                            { id: modelInstance.id }, { [fileKey]: newFileId }
                        ));
                        logFile("Updated model with key,val:%s,%s", fileKey, newFileId);

                        if (upsertErr) { logFile(`error upserting field "${fileKey}", aborting...`, upsertErr); continue; }
                    }

                    // giving the owner of the file/image permission to view it
                    const rpModel = Model.app.models.RecordsPermissions;
                    let rpData = {
                        model: ModelToSaveName,
                        recordId: newFileId,
                        principalType: USER,
                        principalId: fileOwnerId,
                        permission: ALLOW
                    }
                    let [rpErr, rpRes] = await to(rpModel.findOrCreate(rpData));
                    logFile("New permission row is created on RecordsPermissions model with data", rpData);
                    if (rpErr) { console.error(`Error granting permissions to file owner, aborting...`, rpErr); continue; }

                    //calling a custom remote method after FilesHandler is done
                    let afhData = { model: ModelToSaveName, recordId: newFileId, principalId: fileOwnerId };
                    Model.afterFilesHandler && await Model.afterFilesHandler(afhData, oldFileId, modelInstance, ctx);
                };
            }
            return next();
        })();
    });
}

function getSaveDir(type) {
    try {
        const baseFileDirPath = process.env.NODE_ENV == 'production' ? '../../../../../build' : '../../../../../public';
        const saveDir = path.join(__dirname, `${baseFileDirPath}/${folders[type]}/`);
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

function getRegex(extension) {
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
        // TODO Shira: uncomment this when we start handling webm
        // case 'webm':
        //     //TODO Shira: make the following regex be valid for both "video" and "audio"
        //     return /^data:video\/[a-zA-Z0-9?><;,{}[\]\-_+=!@#$%\^&*|']+;base64,/; 
        case 'webm':
            return /^data:(video|audio)\/[a-zA-Z0-9?><;,{}[\]\-_+=!@#$%\^&*|']+;base64,/;
        case 'mp4':
            return /^data:video+\/mp4?;base64,/;
        // case 'webm':
        //     return /^data:video+\/webm?;base64,/; // return /^data:(\bvideo\b)|(\baudio\b)+\/webm?;base64,/
        case 'ogg':
            return /^data:video+\/ogg?;base64,/;
        case 'avi':
            return /^data:video+\/avi?;base64,/;
	case 'mov':
	    return /^data:video+\/quicktime?;base64,/;
	default:
            return null;
    }
}

function getFileExtension(fileSrc) {
    let mimeType = base64MimeType(fileSrc);
    logFile("Base64 mimeType of file", mimeType);
    if (!mimeType) return null;

    const mimeTypes = {
        //files
        pdf: 'application/pdf',
        doc: 'application/msword',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        //images
        png: 'image/png',
        jpeg: 'image/jpeg', //jpeg & jpg
        gif: 'image/gif',
        svg: 'image/svg+xml',
        //audio
        mp3: 'audio/mp3',
        wav: 'audio/wav',
        //video
        mp4: 'video/mp4',
        ogg: 'video/ogg',
        avi: 'video/avi',
	mov: 'video/quicktime',
        //video+audio
        webm: ['audio/webm', 'video/webm'],
    };

    // return Object.keys(mimeTypes).find(key => mimeTypes[key] === mimeType);
    return Object.keys(mimeTypes).find(key => {
        if (Array.isArray(mimeTypes[key]) && mimeTypes[key].includes(mimeType)) return key;
        return mimeTypes[key] === mimeType;
    });
}

function base64MimeType(encoded) {
    if (typeof encoded !== 'string') return null;

    var mime = encoded.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
    if (mime && mime.length) return mime[1];
    return null;
}
