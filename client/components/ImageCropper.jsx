import React from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

/**This compoent expects to have all props (exept crop -> it is used in the father component)
 * @prop {object} crop if to enable this all - contains all rest of props
 * @prop {boolean} ellipse if crop shape should be ellipse
 * @prop {number} proportion of the crop
 * @prop {string} direction "ltr"/ "rtl" 
 * @prop {boolean} grid add  squere grid-like lines to help user with proportion
 * @prop {object} texts:
 * @key {string} popupTitle 
 * @key {string} close 
 * @key {string} done
 * @key {string} cropButtonName
*/

const ImageCropper = props => {
    const [crop, setCrop] = React.useState({ aspect: props.proportion });
    const [src, setSrc] = React.useState();
    React.useEffect(() => setSrc(props.src), [props.src])//tmp 
    const canvasRef = React.createRef();
    const createBase64Canvas = () => { //using canvas help
        const canvas = canvasRef.current;
        const image = new Image()
        const ctx = canvas.getContext('2d');
        image.src = src;
        const sx = (crop.x * image.width) / 100;
        const sy = (crop.y * image.height) / 100;
        const srcWidth = crop.width * image.width / 100;
        const srcHeight = crop.height * image.height / 100;
        const destinationWidth = srcWidth;
        const destinationHeight = srcHeight;
        canvas.width = destinationWidth;
        canvas.height = destinationHeight;

        if (props.ellipse) {
            //to create circle o
            ctx.ellipse(destinationWidth / 2, destinationHeight / 2, destinationWidth / 2, destinationHeight / 2, 0, 0, 2 * Math.PI)
            ctx.clip();
        }
        // real size goes by css
        image.onload = () => {
            ctx.drawImage(image, sx, sy, srcWidth, srcHeight, 0, 0, destinationWidth, destinationHeight);

            const newBase64 = canvas.toDataURL();
            setCrop({});
            props.onChange({ target: { files: [newBase64] } }, true);
        }

    }
    let texts = props.texts || {};
    return <div dir={props.dir || "ltr"}>
        <div className="modal fade" id="myCropModal" /*ref="cropPopup"*/ role="dialog" >
            <div className="modal-dialog modal-lg">
                {/* <!-- Modal content--> */}
                <div className="modal-content">
                    <div className="modal-header">
                        <h4 className="modal-title">{texts.popupTitle ? texts.popupTitle : "Plese crop your image"}</h4>
                    </div>
                    <div className="modal-body">
                        {/* body of modal */}
                        {/* {console.log("image src: ", src)} */}
                        <ReactCrop //tmp we need to figure out props here
                            onComplete={(px, percentCrop) => setCrop(percentCrop)}
                            src={src}
                            crop={crop}
                            ruleOfThirds={props.grid || false}
                            onChange={(px, percentCrop) => setCrop(percentCrop)}
                            circularCrop={props.ellipse}
                        />
                    </div>
                    <div className="modal-footer">
                        <button onClick={props.getCropUrl ? props.getCropUrl : () => console.log("image changed, no callback to send data to")}
                            type="button" className="btn btn-secondary cancleCropButton " data-dismiss="modal">{texts.close ? texts.close : "Close"}</button>
                        <button onClick={() => createBase64Canvas(src, crop, canvasRef.current)}//run onChange with resault
                            type="button" className="btn btn-primary "
                            data-dismiss="modal">{texts.done ? texts.done : "done"}</button>
                    </div>
                </div>

            </div>
        </div>
        {/* Canvas */}
        <canvas id="imageCanvas" style={{ display: "none" }} ref={canvasRef} />
    </div>
}

export default ImageCropper;

