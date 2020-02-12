const EnvHandler = require('./../../../tools/server/lib/EnvHandler');

module.exports = function (BaseFiles) {
    BaseFiles.observe('loaded', function (ctx, next) {

        let fData = null;
        if (ctx.instance) {
            fData = ctx.instance;
        }
        else {
            const hostName = EnvHandler.getHostName();
            fData = ctx.data;
            fData.path = `${hostName}/files/${fData.category}/${fData.id}.${fData.format}`;
        };
        ctx.data = fData;
        next();
    });
};
