const fs = require('fs');
const path = require('path');
const PermissionsFilter = require('./../lib/PermissionsFilter');
const logFile = require('debug')('model:file');
const Consts = require('../../consts/Consts.json');

module.exports = function (app) {

    function getContentType(extension, type) {
        if (!extension) return null;
        return Consts.FILE_TYPES_AND_EXTENSIONS_AND_MIMES[type][extension];
    }

    function allowFileAccess(req, res, fileType) {


        (async () => {

            const permissionsFilter = new PermissionsFilter(req, app, `${fileType}s`);
            const allowAccess = await permissionsFilter.filterByPermissions(); //true/false


            if (!allowAccess) {
                logFile("Access is denied for this specific user, for further info see records_permissions table");
                res.sendStatus(403); return;
            } else {
                logFile("Access is allowed for this specific user, for further info see records_permissions table");
            }

            //also on production we save into public (and not to build because the file can get delete from 'build')
            const baseFileDirPath = 'public';
            const filePath = path.join(__dirname, '../../../../../') + `${baseFileDirPath}/${Consts.FOLDERS[fileType]}/${req.params[0]}`;
            let ext = req.params[0].split('.');
            const fileExtension = ext[ext.length - 1]; //pdf, mp3, wav...

            logFile("filePath?", filePath);

            let contentType = getContentType(fileExtension, fileType);
            logFile("contentType", contentType)
            if (!contentType) { logFile(contentType); res.sendStatus(404); return; }

            fs.readFile(filePath, function (err, data) {
                if (err) return res.sendStatus(404);
                else {
                    res.header('Content-disposition', `inline; filename=thi3is@fi1E.${fileExtension}`);
                    res.contentType(contentType);
                    res.send(data);
                }
            });
        })();
    }


    app.get(`/${Consts.FOLDERS[Consts.FILE_TYPE_FILE]}/*`, function (req, res) {
        logFile("fileshandler routes for verb GET with /files/* is launched");
        allowFileAccess(req, res, Consts.FILE_TYPE_FILE);
    });

    app.get(`/${Consts.FOLDERS[Consts.FILE_TYPE_IMAGE]}/*`, function (req, res) {
        logFile("fileshandler routes for verb GET with /imgs/* is launched");
        allowFileAccess(req, res, Consts.FILE_TYPE_IMAGE);
    });

    app.get(`/${Consts.FOLDERS[Consts.FILE_TYPE_VIDEO]}/*`, function (req, res) {
        logFile("fileshandler routes for verb GET with /imgs/* is launched");
        allowFileAccess(req, res, Consts.FILE_TYPE_VIDEO);
    });

    app.get(`/${Consts.FOLDERS[Consts.FILE_TYPE_AUDIO]}/*`, function (req, res) {
        logFile("fileshandler routes for verb GET with /audios/* is launched");
        allowFileAccess(req, res, Consts.FILE_TYPE_AUDIO);
    });
}
