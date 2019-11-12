
var fs = require('fs');
var path = require('path');
var logFile = require('debug')('model:file');
const https = require('https');

const FILES_DIR = 'public/files/';

const APP_ROOT=path.join(__dirname,'../../../../../');

module.exports = function (BaseFiles) {
    BaseFiles.observe('loaded', function (ctx, next) {

        var fData;
        if (ctx.instance) {    //for first upload
            //  logImage("CTX.instance exists",ctx);
            fData = ctx.instance;
        }
        else {
            // logImage("CTX.instance does not exist",ctx);
            fData = ctx.data;
            fData.path = `/files/${fData.category}/${fData.id}.${fData.format}`;
        };
        ctx.data = fData;
        next();
    });



};
