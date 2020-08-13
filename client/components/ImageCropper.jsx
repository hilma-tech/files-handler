import React, { useState } from 'react';
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
    const [crop, setCrop] = useState({ aspect: props.proportion });
    const [src, setSrc] = useState();
    const [open, setOpen] = useState(true);
    React.useEffect(() => setSrc(props.src), [props.src])//tmp 
    const canvasRef = React.createRef();
    const createBase64Canvas = () => { //using canvas help
        if (crop.width === 0 || crop.height === 0) {
            props.onClose && props.onClose();
            setOpen(false);
            return;
        }
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
            const size = Math.round(newBase64.length * 3 / 4);
            setCrop({}); props.onChange({ target: { files: [{ file: newBase64, size: size }] } }, false, false);
            props.onClose && props.onClose();
        }

    }
    let texts = props.texts || {};
    if (!props.src) {
        // setOpen(false);
        // props.onClose && props.onClose();
        return null;
    }
    return <div dir={props.dir || "ltr"}>

        <div className={`cropModal ${open ? "" : "dontDisplay"}`}/*ref="cropPopup"*/ onClick={() => { props.onClose && props.onClose(); setOpen(false) }}>
            {/* <!-- Modal content--> */}
            <div className="modalContent" onClick={e => e.stopPropagation()}>
                <div className="modalHeader">
                    <h4 className="modalTitle"><strong>{texts.popupTitle ? texts.popupTitle : "Plese crop your image"}</strong></h4>
                </div>
                <hr />
                <div className="modalBody">
                    {/* body of modal */}
                    <ReactCrop
                        className="modalBody"
                        imageStyle={{
                            maxHeight: "60vh",
                            maxWidth: "74vw"
                        }}
                        onComplete={(px, percentCrop) => setCrop(percentCrop)}
                        src={src}
                        crop={crop}
                        ruleOfThirds={props.grid || false}
                        onChange={(px, percentCrop) => setCrop(percentCrop)}
                        circularCrop={props.ellipse}
                    />
                </div>
                <hr />
                <div className="modalFooter">
                    <button onClick={() => {
                        setOpen(false); createBase64Canvas(src, crop, canvasRef.current)
                    }}//run onChange with resault
                        className="doneCropButton  modelCropButton"
                    >{texts.done ? texts.done : "done"}</button>
                    <button onClick={() => {
                        props.onClose && props.onClose();
                        setOpen(false); props.getCropUrl ? props.getCropUrl() : console.log("image changed, no callback to send data to")
                    }}
                        className="cancleCropButton modelCropButton">{texts.close ? texts.close : "Close"}</button>
                </div>
            </div>

        </div>
        {/* Canvas */}
        <canvas id="imageCanvas" style={{ display: "none" }} ref={canvasRef} />
    </div>
}

export default ImageCropper;