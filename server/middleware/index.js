const promisify = require('util').promisify;
const fs = require('fs');
const readFile = promisify(fs.readFile);
const path = require('path')
const PermissionsFilter = require('./../modules/PermissionsFilter');

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

            const filePath = path.join(__dirname, '../../') + `public/files/${req.params[0]}`;
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


    app.get('/api/get-models-list', function (req, res) {

        async function readModels(cb) {

            let list = {};
            let exposeit = [];

            try {
                const configJson = await readFile('server/model-config.json', 'utf-8');
                list = JSON.parse(configJson);

                let keys = Object.keys(list);
                exposeit = keys.filter(function (key) {
                    if (list[key].expose === true) {
                        return true;
                    } else { return false; }
                });
                //esposeit console.log us the models name that the model.config.expose == true.

            } catch (err) {
                cb({});
            }
            cb(exposeit);


        }

        readModels((exposeit) => {

            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(exposeit));

        });

    });

    ///////// GETS THE FORM/TABLE DATA WITH RELATIONS ////////
    app.get('/api/meta/:type/:model', function (req, res) {
        const modelMeta = fs.readFileSync('common/models/' + req.params.model + ".json", 'utf-8');
        const modelMetaJson = JSON.parse(modelMeta).crud;
        const modelRelations = JSON.parse(modelMeta).options.relations || JSON.parse(modelMeta).relations;
        const modelInfo = { fields: modelMetaJson.fields, relations: modelRelations };
        let params = JSON.parse(modelMeta).name;
        let Model = app.models[params];

        if (req.params.type === "form") {
            res.send(JSON.stringify(modelInfo));
        } else if (req.params.type === "table") {
            let fields = {};
            let relations = [];
            Object.keys(modelMetaJson.fields).map(e => (fields[e] = true));
            Object.keys(modelRelations).map(r => (relations.push(r)));
            // console.log(req.query.filter, "req.query.filter");
            let filter = req.query.filter ? JSON.parse(req.query.filter) : {};
            filter.include ? filter.include = filter.include + " " + relations : filter.include = relations;
            filter.fields ? filter.fields = filter.fields + " " + fields : filter.fields = fields;
            Model.find(
                filter
                , function (err, tableData) {
                    if (err) console.log(err)
                    else {
                        let table = {
                            data: tableData,
                            fields: modelMetaJson.fields,
                            relations: modelRelations,
                            tableActions: modelMetaJson.tableActions ? modelMetaJson.tableActions : null
                        }
                        res.setHeader('Content-Type', 'application/json');
                        res.send(JSON.stringify(table));
                    }
                });
        } else res.send("ERROR: You can only get table data or form data. change params accordinly")
    });
}
