
module.exports = function (BaseVideos) {
    BaseVideos.observe('loaded', function (ctx, next) {
        let fData = null;
        if (ctx.instance) {
            fData = ctx.instance;
        }
        else {
            const hostName = process.env.NODE_ENV == 'production' ? '' : 'http://localhost:8080';        
            fData = ctx.data;
            fData.path = `${hostName}/videos/${fData.category}/${fData.id}.${fData.format}`;
        };
        ctx.data = fData;
        next();
    });
};
