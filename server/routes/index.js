const fs = require('fs');
const path = require('path');
const PermissionsFilter = require('./../lib/PermissionsFilter');
const logFile = require('debug')('model:file');

//logFile("fileshandler routes/index is launched?");
const FILE_MODEL = 'files';
const IMAGE_MODEL = 'images';
const folders = {
    [FILE_MODEL]: 'files',
    [IMAGE_MODEL]: 'imgs'
};

module.exports = function (app) {

    function getContentType(extension) {
        if (!extension) return null;

        const contentTypes = {
            //files
            pdf: 'application/pdf',
            doc: 'application/msword',
            docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            //images
            png: 'image/png',
            jpeg: 'image/jpeg', //jpeg & jpg
            jpg: 'image/jpeg',
            gif: 'image/gif',
            //audio
            mp3: 'audio/mp3',
            wav: 'audio/wav'
        };
        return contentTypes[extension];
    }

    function allowFileAccess(req, res, fileModel) {


        (async () => {

            const permissionsFilter = new PermissionsFilter(req, app, null, fileModel);
            const allowAccess = await permissionsFilter.filterByPermissions(); //true/false

            
            if (!allowAccess) { 
            	logFile("Access is denied for this specific user, for further info see records_permissions table");
            	res.sendStatus(403); return; 
            }else{
            	logFile("Access is allowed for this specific user, for further info see records_permissions table");
            }

            const baseFileDirPath = process.env.NODE_ENV == 'production' ? 'build' : 'public';
            const filePath = path.join(__dirname, '../../../../../') + `${baseFileDirPath}/${folders[fileModel]}/${req.params[0]}`;
            const fileExtension = req.params[0].split('.')[1]; //pdf, mp3, wav...
            
            logFile("filePath?",filePath);

            let contentType = getContentType(fileExtension);
            if (!contentType) { res.sendStatus(404); return; }

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

    
    app.get('/files/*', function (req, res) {
        logFile("fileshandler routes for verb GET with /files/* is launched");
        allowFileAccess(req, res, FILE_MODEL);
    });

    app.get('/imgs/*', function (req, res) {
        logFile("fileshandler routes for verb GET with /imgs/* is launched");
        allowFileAccess(req, res, IMAGE_MODEL);
    });

}
