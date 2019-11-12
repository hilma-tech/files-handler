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
const USER = 'USER';
const ALLOW = 'ALLOW';
const logFile = require('debug')('model:file');

module.exports = function FilesHandler(Model) {

    Model.saveFile = async function (file, FileModel, ownerId = null, fileId = null) {

        logFile("Model.saveFile is launched with ownerId",ownerId);
        let saveDir = getSaveDir(file.type);
        let extension = getFileExtension(file.src);
        if (!extension) return false;
        let base64Data = file.src.replace(/^data:[a-z]+\/[a-z]+\d?;base64,/, "");

        // console.log("\nownerId", ownerId);
        let fileObj = {
            category: file.category ? file.category : 'uploaded',
            owner: ownerId,
            format: extension,
            created: Date.now(),
            dontSave: true,// dont let afterSave remote do anything- needed?
            title: file.title
        };

        logFile("fileObj before save",fileObj);

        // If we are posting to and from the same model,
        // the instance was already created in the remote so we just update it 
        if (Model === FileModel && fileId !== null)
            fileObj.id = fileId;

        let specificSaveDir = saveDir + fileObj.category + "/";
        let [err, newFile] = await to(FileModel.upsert(fileObj));

        if (err) { console.error("Error creating file, aborting...", err); return false }
        logFile("New entry created for model ",file.type, newFile);

        let fileTargetPath=null;

        try{
            if (!fs.existsSync(specificSaveDir)) {//create dir if dosent exist.
                fs.mkdirSync(specificSaveDir, { recursive: true });
                logFile("New folder was created ",specificSaveDir);
            }

            fileTargetPath=specificSaveDir + newFile.id + "." + extension;
            fs.writeFileSync(fileTargetPath, base64Data, 'base64');
        }catch(err){
            logFile("Err",err);
        }

        logFile("New file was created of type (%s) on path (%s)",file.type,fileTargetPath);
        logFile("New file id",newFile.id)
        return newFile.id;
    }

    Model.beforeRemote('*', function (ctx, modelInstance, next) {
        
        logFile("Model.beforeRemote is launched");
        if (ctx.req.method !== "POST" && ctx.req.method !== "PUT"/* && !modelInstance.id*/)
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
                    if (typeof data[key] !== "object" || !data[key]) continue;

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
        logFile("Model.afterRemote(*) is launched");
        if (ctx.req.method !== "POST" && ctx.req.method !== "PUT" /*&& !modelInstance.id*/)
            return next();

        let fileOwnerId = (ctx.args.options && ctx.args.options.accessToken) ?
                ctx.args.options.accessToken.userId : //if there's accessToken use userId
                (Model === Model.app.models.CustomUser ? //else, if we are creating new user use new user's id
                    modelInstance.id :
                    null);
        
        //Access is always restricted without authentication
        if (!fileOwnerId){return next();}

        let args = ctx.args;

        (async () => {
            const argsKeys = Object.keys(args);

            for (let i = 0; i < argsKeys.length; i++) { // we are not using map func, because we cannot put async inside it.

                let field = argsKeys[i];
                logFile("Iterating with field (%s)",field);

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
                        // TODO Shira ? - add Audio model and a case for it ?
                        default:continue;
                    }

                    logFile("ModelToSave - Should be either Images/Files",ModelToSave);


                    // If we are posting to and from the same model more than 1 file.. 
                    // Example: posting from Files (table) to Files (table) 2 files
                    let index = Object.keys(filesToSave).indexOf(fileKey);
                    let fileId = null;
                    if (index === 0 /*&& Model === ModelToSave*/) fileId = modelInstance.id;

                    let newFileId = await Model.saveFile(file, ModelToSave, fileOwnerId, fileId);
                    if (!newFileId) { console.log("Couldn't create your file dude, aborting..."); continue; }

                    // If [fileKey] doesnt exist in Model then dont upsert
                    let [findErr, findRes] = await to(Model.findOne({ where: { id: modelInstance.id } }));
                    if (findErr || !findRes) { console.error("Error finding field, aborting...", findErr); continue; }
                    if (!(fileKey in findRes)) { console.error(`The field "${fileKey}" doesnt exist in model, skipping upsert to that field...`); continue; }

                    // Updating the row to include the id of the file added
                    let [upsertErr, upsertRes] = await to(Model.upsertWithWhere(
                        { id: modelInstance.id }, { [fileKey]: newFileId }
                    ));
                    logFile("Updated model with key,val:%s,%s",fileKey,newFileId);

                    if (upsertErr) { console.error(`error upserting field "${fileKey}", aborting...`, upsertErr); continue; }

                    // giving the owner of the file/image permission to view it
                    const rpModel = Model.app.models.RecordsPermissions;
                    let rpData = {
                        model: ModelToSaveName,
                        recordId: newFileId,
                        principalType: USER,
                        principalId: fileOwnerId,
                        permission: ALLOW
                    }
                    let [rpErr, rpRes] = await to(rpModel.create(rpData));
                    logFile("New permission row is created on RecordsPermissions model with data",rpData);
                    if (rpErr) { console.error(`Error granting permissions to file owner, aborting...`, rpErr); continue; }
                };
            }
            return next();
        })();
    });
}

function getSaveDir(type) {
    const saveDir = path.join(__dirname, `../../../../../public/${type}s/`);
    if (!fs.existsSync(saveDir)) {//create dir if dosent exist.
        fs.mkdirSync(saveDir, { recursive: true });
    }
    return saveDir;
}

function getFileExtension(fileSrc) {
    let mimeType = base64MimeType(fileSrc);
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
        //audio
        mp3: 'audio/mp3',
        wav: 'audio/wav'

    };

    return Object.keys(mimeTypes).find(key => mimeTypes[key] === mimeType);
}

function base64MimeType(encoded) {
    if (typeof encoded !== 'string') return null;

    var mime = encoded.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
    if (mime && mime.length) return mime[1];
    return null;
}
