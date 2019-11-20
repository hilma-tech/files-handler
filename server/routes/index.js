const fs = require('fs');
const path = require('path');
const PermissionsFilter = require('./../lib/PermissionsFilter');
const logFile = require('debug')('model:file');

logFile("fileshandler routes/index is launched?");

module.exports = function (app) {

    function getContentType(extension) {
            if (!extension) return null;

            const contentTypes = {
                pdf: 'application/pdf',
                mp3: 'audio/mp3',
                wav: 'audio/wav',
                png: 'image/png'
            };
            return contentTypes[extension];
    }

    function allowFileAccess(req, res) {

        


        (async () => {

            const permissionsFilter = new PermissionsFilter(req, app);
            const allowAccess = await permissionsFilter.filterByPermissions(); //true/false

            console.log("allowaccess", allowAccess);
            if (!allowAccess) { res.sendStatus(403); return; }

            const baseFileDirPath = process.env.NODE_ENV == 'production' ? 'build' : 'public';
            const filePath = path.join(__dirname, '../../../../../') + `${baseFileDirPath}/files/${req.params[0]}`;
            const fileExtension = req.params[0].split('.')[1]; //pdf, mp3, wav...
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
        allowFileAccess(req, res);
    });

    app.get('/images/*', function (req, res) {
    	logFile("fileshandler routes for verb GET with /images/* is launched");
        console.log("we are here")
        allowFileAccess(req,res);
    })

}
