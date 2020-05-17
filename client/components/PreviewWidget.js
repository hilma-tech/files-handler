import React, { Component } from 'react';
import ImgCrop from "./ImageCropper";
export default class PreviewWidget extends Component {
    constructor(props) {
        super(props);
        this.state = { crop: false }
    }
    render() {
        return (
            <div className="preview-widget">
                {this.props.showPopup && <div className="dark-background" onClick={this.props.toggleShowPopup} />}
                <div className={`image-popup ${this.props.showPopup ? "scale-in-center" : "scale-out-center"}`} >

                    {this.state.crop && this.props.src ? <ImgCrop
                        onChange={this.props.onChange}
                        onClose={() => this.setState({ crop: false })}
                        src={this.props.src}
                        {...this.props.crop} /> : this.props.chosenImg}
                    {

                        (this.props.enableEdit || this.props.enableDelete) && !this.props.disabled &&
                        <div>
                            <div className="tool-bar-dark-background" />
                            <div className="tool-bar">
                                {this.props.enableEdit && <label className="tool-bar-label" htmlFor={this.props.inputId}><img className="edit" src={require('../../imgs/edit.svg')} /></label>}
                                {this.props.enableDelete && <img className="bin" src={require('../../imgs/bin.svg')} onClick={this.props.removeFile} />}
                                {this.props.crop && this.props.src && <img className="crop" onClick={() => this.setState({ crop: true })} alt="crop" src={require('../../imgs/crop.svg')}/> }

                            </div>
                        </div>}
                </div>
            </div>
        );
    }
}