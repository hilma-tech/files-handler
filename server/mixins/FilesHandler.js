'use strict';
const path = require('path');
const resizeOptimizeImages = require('resize-optimize-images');
const sizeOf = require('image-size');
const Consts = require('../../consts/Consts.json');
const fs = require('fs');
const logFile = require('debug')('model:file');
const to = (promise) => {
    return promise.then(data => {
        return [null, data];
    })
        .catch(err => [err]);
}

module.exports = function FilesHandler(Model) {

    Model.getFileModelOfFile = function (file) {
        switch (file.type) {
            case Consts.FILE_TYPE_IMAGE:
                return [Model.app.models.Images, `${Consts.FILE_TYPE_IMAGE}s`]
            case Consts.FILE_TYPE_FILE:
                return [Model.app.models.Files, `${Consts.FILE_TYPE_FILE}s`]
            case Consts.FILE_TYPE_VIDEO:
                return [Model.app.models.Video, `${Consts.FILE_TYPE_VIDEO}s`]
            case Consts.FILE_TYPE_AUDIO:
                return [Model.app.models.Audio, `${Consts.FILE_TYPE_AUDIO}s`]
            default:
                return [null, null];
        }
    }

    Model.deleteFile = async function (prevFileId, FileModel) {
        logFile("Model.deleteFile is launched now with prevFileId: ", prevFileId);

        let [prevFileErr, prevFileRes] = await to(FileModel.findOne({ where: { id: prevFileId } }));
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
        let size = file.multipleSizes === true ? await getImgWidth(base64Data) : null;
        let fileObj = {
            category: file.category ? file.category : 'uploaded',
            owner: ownerId,
            format: extension,
            created: Date.now(),
            dontSave: true,// dont let afterSave remote do anything- needed?
            title: file.title,
            size: size,
            description: file.description
        };

        logFile("fileObj before save", fileObj);

        // If we are posting to and from the same model,
        // the instance was already created in the remote so we just update it 
        if (/*Model === FileModel && */fileId !== null)
            fileObj.id = fileId;
        logFile("fileObj before save", fileObj);

        let specificSaveDir = saveDir + fileObj.category + "/";
        let [errr, newFile] = await to(FileModel.upsert(fileObj));
        if (errr) { console.error("Error creating file, aborting...", errr); return false }
        logFile("New entry created for model ", file.type, newFile);

        let fileTargetPath = null;
        try {
            if (!fs.existsSync(specificSaveDir)) {//create dir if dosent exist.
                fs.mkdirSync(specificSaveDir, { recursive: true });
                logFile("New folder was created ", specificSaveDir);
            }

            if (file.type === "image" && file.multipleSizes === true) {
                let sizes = await tripleimg(specificSaveDir + newFile.id, extension, size)

                logFile("sizes", sizes)
                sizes.map((size) => {
                    fs.writeFileSync(size.filePath, base64Data, 'base64');
                    resizeImg(size.filePath, size.width)
                })
            } else {
                fileTargetPath = specificSaveDir + newFile.id + "." + extension;
                fs.writeFileSync(fileTargetPath, base64Data, 'base64');
            }
        } catch (err) {
            logFile("Err", err);
        }

        logFile("New file was created of type (%s) on path (%s)", file.type);
        logFile("New file id", newFile.id)
        return newFile.id;
    }

    Model.saveFileWithPermissions = async function (file, fileKey, fileOwnerId, filesToSave, modelInstance, ctx, isMultiFilesSave = false) {
        logFile("Debug 6")

        let [FileModel, FileModelName] = Model.getFileModelOfFile(file, Model);

        logFile("FileModel - Should be either Images/Files/Video", FileModelName);

        // If we are posting to and from the same model more than 1 file.. 
        // Example: posting from Files (table) to Files (table) 2 files
        let index = Array.isArray(filesToSave[fileKey]) ?
            filesToSave[fileKey].indexOf(file) : Object.keys(filesToSave).indexOf(fileKey);

        let oldFileId = null;

        if (modelInstance[fileKey] && modelInstance[fileKey] !== {}) oldFileId = await Model.deleteFile(modelInstance[fileKey], FileModel);
        logFile("FileId right before saveFile is launched is", oldFileId);

        // If the first file we want to upload (not update) to the same model as the remoteModel is not in size range,
        // we need to delete the empty instance that was created in the model.
        if (!file.src && index === 0 && Model === FileModel && oldFileId === null) {
            let [modelErr, modelRes] = await to(Model.destroyById(modelInstance.id));
            if (modelErr || !modelRes) return logFile("Error deleting empty row in Images model, aborting...", modelErr);
            logFile("Empty row in FileModel is deleted");
        }

        if (!file.src) {
            logFile("The size of file with key %s is not in range. Canceling...", fileKey);
            return Consts.FILE_UPLOAD_STATUS_ERROR_SIZE_NOT_IN_RANGE;
        }

        if (oldFileId === null && index === 0 && Model === FileModel) oldFileId = modelInstance.id;

        let newFileId = await Model.saveFile(file, FileModel, fileOwnerId, oldFileId);
        if (!newFileId) return logFile("Couldn't create your file, aborting...");

        if (isMultiFilesSave) {
            let relations = Model.relations;
            if (!relations) return logFile("No relations, couldn't save new file id reference in modelThrough...");
            for (let relationName in relations) {
                let relation = relations[relationName];
                if (relation.type !== "hasMany") continue;
                if (relation.modelTo !== FileModel) continue;
                if (relation.keyThrough !== fileKey) continue;

                let modelThrough = relation.modelThrough;
                let keyTo = relation.keyTo;

                let newModelThroughInstance = { created: Date.now(), modified: Date.now() };
                newModelThroughInstance[keyTo] = modelInstance.id;
                newModelThroughInstance[fileKey] = newFileId;

                // If [fileKey] doesn't exist in Model then don't upsert
                let modelThroughProperties = modelThrough.definition.properties;
                if (!modelThroughProperties || typeof modelThroughProperties !== "object") return logFile("No properties object, couldn't save new file id reference in modelThrough...");
                if (!Object.keys(modelThroughProperties).includes(fileKey)) return logFile(`The field "${fileKey}" doesnt exist in modelThrough ${modelThrough}, skipping upsert to that field...`);

                // Creating a new row at modelThrough to include the relation between the newModelInstance & newFile
                let [modelTroughErr, modelTroughRes] = await to(modelThrough.create(newModelThroughInstance));
                if (modelTroughErr || !modelTroughRes) return logFile("Error creating new instance in modelThrough, aborting...", modelTroughErr);
                logFile(`New row created at model ${modelThrough.name} with ${keyTo}=${modelInstance.id}, ${fileKey}=${newFileId}`);
            }
        }
        else {
            // If [fileKey] doesn't exist in Model then don't upsert
            let [findErr, findRes] = await to(Model.findOne({ where: { id: modelInstance.id } }));
            if (findErr || !findRes) return logFile("Error finding field, aborting...", findErr);

            if (typeof findRes !== 'object') return;
            let findResKeys = (findRes && findRes.__data) ? Object.keys(findRes.__data) : Object.keys(findRes);
            if (!findResKeys) return;
            if (!findResKeys.includes(fileKey)) { logFile(`The field "${fileKey}" doesnt exist in model, skipping upsert to that field...`); }
            else {
                // Updating the row to include the id of the file added
                let [upsertErr, upsertRes] = await to(Model.upsertWithWhere(
                    { id: modelInstance.id }, { [fileKey]: newFileId }
                ));
                logFile("Updated model with key,val:%s,%s", fileKey, newFileId);

                if (upsertErr) return logFile(`Error upserting field "${fileKey}", aborting...`, upsertErr);
            }
        }

        // giving the owner of the file/image permission to view it
        const rpModel = Model.app.models.RecordsPermissions;
        let rpData = {
            model: FileModelName,
            recordId: newFileId,
            principalType: Consts.USER,
            principalId: fileOwnerId,
            permission: Consts.ALLOW
        }
        let [rpErr, rpRes] = await to(rpModel.findOrCreate(rpData));
        logFile("New permission row is created on RecordsPermissions model with data", rpData);
        if (rpErr) return logFile(`Error granting permissions to file owner, aborting...`, rpErr);

        //calling a custom remote method after FilesHandler is done
        let afhData = { model: FileModelName, recordId: newFileId, principalId: fileOwnerId };
        Model.afterFilesHandler && await Model.afterFilesHandler(afhData, oldFileId, modelInstance, ctx);
    }

    Model.beforeRemote('*', function (ctx, modelInstance, next) {

        logFile("Model.beforeRemote is launched", ctx.req.method);
        if (ctx.req.method !== "POST" && ctx.req.method !== "PUT" && ctx.req.method !== "PATCH"/* && !modelInstance.id*/)
            return next()

        let args = ctx.args;
        let data, field, key;

        (async () => {
            const argsKeys = Object.keys(args);

            // we are not using map funcs, because we cannot put async inside it.
            for (let i = 0; i < argsKeys.length; i++) {
                field = argsKeys[i];
                if (field === "options") continue;
                data = args[field];
                if (!data || typeof data !== "object" || Array.isArray(data)) continue;
                const dataKeys = Object.keys(data);

                for (let j = 0; j < dataKeys.length; j++) {
                    key = dataKeys[j];
                    let keyData = data[key];
                    if (!keyData || typeof keyData !== "object") continue;

                    let isFileInRange = true;

                    if (!Array.isArray(keyData)) {
                        if (!keyData.src || !keyData.type) continue;
                        if (keyData.type === Consts.FILE_TYPE_IMAGE) isFileInRange = await isImgSizeInRange(keyData);
                        keyData.src = isFileInRange ? keyData.src : null;
                    }
                    else { // keyData is an array
                        if (!keyData.every(val =>
                            (typeof val === "object" && val.src && val.type))) continue; // the arr is not from multiFilesHandler

                        for (let z = 0; z < keyData.length; z++) {
                            if (keyData[z].type === Consts.FILE_TYPE_IMAGE) {
                                isFileInRange = await isImgSizeInRange(keyData[z]);
                                logFile("isFileInRange", isFileInRange)
                                keyData[z].src = isFileInRange ? keyData[z].src : null;
                            }
                        }
                    }

                    let filesToSave = ctx.args[field].filesToSave || {};
                    filesToSave[key] = keyData;
                    ctx.args[field]["filesToSave"] = filesToSave;
                    ctx.args[field][key] = null;
                    //the lines above take the data in dataObj and put it in obj called filesToSave inside dataObj
                    //so we can later take it and add it to the file/img/audio table
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

                logFile('files to save', Object.keys(args[field]))
                if (!args[field] || !args[field].filesToSave) return next();

                logFile("Debug 1")
                let filesToSave = args[field].filesToSave;

                for (let fileKey in filesToSave) {
                    logFile("Debug 2")
                    const fileOrFiles = filesToSave[fileKey];

                    if (Array.isArray(fileOrFiles)) {
                        logFile("Debug 3", fileOrFiles.length)
                        for (let j = 0; j < fileOrFiles.length; j++) {
                            logFile("Debug 4")
                            if (typeof fileOrFiles[j] !== "object") continue;
                            logFile("Debug 5")
                            let isErr = await Model.saveFileWithPermissions(fileOrFiles[j], fileKey, fileOwnerId, filesToSave, modelInstance, ctx, true);
                            if (isErr === Consts.FILE_UPLOAD_STATUS_ERROR_SIZE_NOT_IN_RANGE) logFile("Update the res with 'file not in range err'");
                        }
                    }
                    else {
                        if (typeof fileOrFiles !== "object") continue;
                        let isErr = await Model.saveFileWithPermissions(fileOrFiles, fileKey, fileOwnerId, filesToSave, modelInstance, ctx);
                        if (isErr === Consts.FILE_UPLOAD_STATUS_ERROR_SIZE_NOT_IN_RANGE) logFile("Update the res with 'file not in range err'");
                    }
                }
            }
            return next();
        })();
    });
}

function getSaveDir(type) {
    logFile("type", type)
    try {
        const baseFileDirPath = process.env.NODE_ENV == 'production' ? '../../../../../build' : '../../../../../public';
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

async function resizeImg(imgPath, width) {
    const options = {
        images: [imgPath],
        width: width
    };

    await resizeOptimizeImages(options);
}

async function getImgWidth(base64Data) {
    let img = new Buffer(base64Data, 'base64');
    let dimensions = sizeOf(img)
    return dimensions.width;
}

async function tripleimg(fileTargetPath, extension, width) {
    let sizesPath = [{ filePath: fileTargetPath + '.s.' + extension, width: Consts.IMAGE_SIZE_SMALL_IN_PX }]
    if (width >= Consts.IMAGE_SIZE_MEDIUM_IN_PX) {
        sizesPath.push({ filePath: fileTargetPath + '.m.' + extension, width: Consts.IMAGE_SIZE_MEDIUM_IN_PX })
    }
    if (width >= Consts.IMAGE_SIZE_LARGE_IN_PX) {
        sizesPath.push({ filePath: fileTargetPath + '.l.' + extension, width: Consts.IMAGE_SIZE_LARGE_IN_PX })
    }
    return sizesPath;
}

async function isImgSizeInRange(keyData) {
    if (keyData.type === 'image') {
        let extension = getFileExtension(keyData.src);
        if (!extension) return false;
        let regex = getRegex(extension);
        if (!regex) return false;
        let base64Data = keyData.src.replace(regex, '');
        if ((await getImgWidth(base64Data)) < Consts.IMAGE_SIZE_SMALL_IN_PX) {
            console.error('ERR: img is to small');
            return false;
        }
    }
    return true;
}
