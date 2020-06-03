//from https://www.npmjs.com/package/reset-image-orientation
const EXIF_ORIENTATION = {
    // 1= 0 degrees: the correct orientation, no adjustment is required.
    // 2= 0 degrees, mirrored: image has been flipped back-to-front.
    // 3= 180 degrees: image is upside down.
    // 4= 180 degrees, mirrored: image is upside down and flipped back-to-front.
    // 5= 90 degrees: image is on its side.
    // 6= 90 degrees, mirrored: image is on its side and flipped back-to-front.
    // 7= 270 degrees: image is on its far side.
    // 8= 270 degrees, mirrored: image is on its far side and flipped back-to-front
    MIRRORED: 2,
    UPSIDE_DOWN: 3,
    UPSIDE_DOWN_MIRRORED: 4,
    DEG_90: 5,
    DEG_90_MIRRORED: 6,
    DEG_270: 7,
    DEG_270_MIRRORED: 8
}

const FixImgOrientation = {

    // get file and return the EXIF orientation
    // EXIF => Exchangeable image file form
    getOrientation(file, cb) {
        var reader = new FileReader();
        reader.onload = function () {
            var view = new DataView(reader.result);
            if (view.getUint16(0, false) !== 0xFFD8) {
                return cb(-2);
            }
            var length = view.byteLength;
            var offset = 2;
            while (offset < length) {
                var marker = view.getUint16(offset, false);
                offset += 2;
                if (marker === 0xFFE1) {
                    if (view.getUint32(offset += 2, false) != 0x45786966) {
                        return cb(-1);
                    }
                    var little = view.getUint16(offset += 6, false) === 0x4949;
                    offset += view.getUint32(offset + 4, little);
                    var tags = view.getUint16(offset, little);
                    offset += 2;
                    for (var i = 0; i < tags; i++) {
                        if (view.getUint16(offset + (i * 12), little) == 0x0112) {
                            return cb(view.getUint16(offset + (i * 12) + 8, little));
                        }
                    }
                }
                else if ((marker & 0xFF00) !== 0xFF00) {
                    break;
                }
                else {
                    offset += view.getUint16(offset, false);
                }
            }
            return cb(-1);
        };
        reader.readAsArrayBuffer(file.slice(0, 64 * 1024));
    },

    //reset the orientation of the image to 0 degrees: the correct orientation, no adjustment is required.
    resetOrientation(file) {
        return new Promise((resolve, reject) => {

            var img = new Image();
            var reader = new FileReader();
            var self = this;
            reader.readAsDataURL(file);
            img.onload = function () {
                var width = img.width;
                var height = img.height;
                var canvas = document.createElement('canvas');
                var ctx = canvas.getContext('2d');
                // set proper canvas dimensions before transform & export
                self.getOrientation(file, function (srcOrientation) {

                    if (srcOrientation > 4 && srcOrientation < 9) {
                        canvas.width = height;
                        canvas.height = width;
                    }
                    else {
                        canvas.width = width;
                        canvas.height = height;
                    }
                    // transform context before drawing image
                    switch (srcOrientation) {
                        case EXIF_ORIENTATION.MIRRORED:
                            ctx && ctx.transform(-1, 0, 0, 1, width, 0);
                            break;
                        case EXIF_ORIENTATION.UPSIDE_DOWN:
                            ctx && ctx.transform(-1, 0, 0, -1, width, height);
                            break;
                        case EXIF_ORIENTATION.UPSIDE_DOWN_MIRRORED:
                            ctx && ctx.transform(1, 0, 0, -1, 0, height);
                            break;
                        case EXIF_ORIENTATION.DEG_90:
                            ctx && ctx.transform(0, 1, 1, 0, 0, 0);
                            break;
                        case EXIF_ORIENTATION.DEG_90_MIRRORED:
                            ctx && ctx.transform(0, 1, -1, 0, height, 0);
                            break;
                        case EXIF_ORIENTATION.DEG_270:
                            ctx && ctx.transform(0, -1, -1, 0, height, width);
                            break;
                        case EXIF_ORIENTATION.DEG_270_MIRRORED:
                            ctx && ctx.transform(0, -1, 1, 0, 0, width);
                            break;
                        default: break;
                    }
                    // draw image
                    if (ctx) {
                        ctx.drawImage(img, 0, 0);
                    }
                    // export base64
                    resolve(canvas.toDataURL(file.type));
                });
            };
            reader.onloadend = function () {
                img.src = reader.result;
            };
        })
    }
}
export default FixImgOrientation;