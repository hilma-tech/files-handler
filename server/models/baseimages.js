
var fs = require('fs');
var path = require('path');
var logImage = require('debug')('model:image');
const https = require('https');
const IMAGES_DIR = 'public/images/';
module.exports = function (BaseImages) {

    BaseImages.observe('loaded', function (ctx, next) {

        var fData;
        if (ctx.instance) {    //for first upload
            //  logImage("CTX.instance exists",ctx);
            fData = ctx.instance;
        }
        else {
            const hostName = process.env.NODE_ENV == 'production' ?'https://myday.carmel6000.com' : 'http://localhost:8080';            
            fData = ctx.data;
            fData.path = `${hostName}/imgs/${fData.category}/${fData.id}.${fData.format}`;
        };
        ctx.data = fData;
        next();
    });





    /** 
    This function gets url and data of online image, and copies this image to our server.
    It also register this image to Image table.
    **/
    BaseImages.downloadToServer = function (data, options, cb) {

        //DEPRECATED UNTIL WILL BE SECURED (Eran)
        return cb(null,{});

        let saveDir = path.join(__dirname, '../', '../', IMAGES_DIR, data.category);
        let extention = path.extname(data.url).substr(1);
        console.log("data!!", data)
        let imgObj = {
            category: data.category,
            owner: options.accessToken ? options.accessToken.userId : null,
            format: extention,
            created: Date.now(),
            dontSave: true,// dont let afterSave remote do anything
            title: data.title
        };
        BaseImages.create(imgObj, (err, res) => {
            if (err) {
                console.log("error on create record!", err);
                return cb(err.message);
            }
            let saveFile = path.join(saveDir, `/${res.id}.${extention}`);
            if (!fs.existsSync(saveDir))
                fs.mkdirSync(saveDir, { recursive: true });
            var file = fs.createWriteStream(saveFile);
            https.get(data.url, function (response) {
                try {
                    response.pipe(file);
                    return cb(null, res);
                }
                catch (error) {
                    console.error("ERROR", error.message);
                    return cb(error.message);
                }
            });
        });
    };

    BaseImages.getUsersImages = function (filter, options, cb) {
        try {
            let userId = options.accessToken.userId;
            filter = filter ? JSON.parse(filter) : {};
            return BaseImages.find({ where: { owner: userId }, ...filter }, options, (err, res) => {
                if (err) return cb(err)
                res.forEach(image => {
                    BaseImages.owner = null;
                });
                return cb(null, res);
            });
        }
        catch (err) {
            return cb(null, []); //no userid return empty
        }
    }

    BaseImages.remoteMethod('downloadToServer', {
        http: {
            verb: 'post'
        },
        accepts: [
            { arg: 'data', type: 'object' },
            { arg: 'options', type: 'object', http: 'optionsFromRequest' }
        ],
        returns: { arg: 'res', type: 'object', root: true }
    });

    BaseImages.remoteMethod('getUsersImages', {
        http: {
            verb: 'get'
        },
        description: "***REMOTE*** filter images to user",
        accepts: [
            { arg: 'filter', type: 'string' },
            { arg: 'options', type: 'object', http: 'optionsFromRequest' }
        ],
        returns: { arg: 'res', type: 'object', root: true }
    });
};





// ~~~~ EXAMPLE OF USAGE ~~~~ 

// Model.saveImage = function (form, cb) {
//     console.log("image-id", form.profile_image);
//     cb(null, { success: 1 });
// }

// Model.remoteMethod('saveImage', {
//     verb: "post",
//     accepts: [
//         { arg: 'form', type: 'object' },
//     ],
//     returns: { arg: 'res', type: 'object', root: true },
//     description: "check."
// });
