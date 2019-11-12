const readFile = promisify(fs.readFile);
const path = require('path')
const PermissionsFilter = require('./../lib/PermissionsFilter');

module.exports = function (app) {

app.get('/files/*', function (req, res) {

    function getContentType(extension) {
        if (!extension) return null;

        const contentTypes = {
            pdf: 'application/pdf',
            mp3: 'audio/mp3',
            wav: 'audio/wav'
        };
        return contentTypes[extension];
    }

    (async () => {
        const permissionsFilter = new PermissionsFilter(req, app);
        const allowAccess = await permissionsFilter.filterByPermissions(); //true/false
        if (!allowAccess) { res.sendStatus(403); return; }

        const filePath = path.join(__dirname, '../../../../../') + `public/files/${req.params[0]}`;
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

});

}