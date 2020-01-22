import React, { Component } from 'react';

export default class PreviewWidget extends Component {

    constructor(props) {
        super(props);

        this.state = {
            showPopup: this.props.showPopup
        };
    }

    render() {
        return (
            <div className="preview-widget">
                {this.props.showPopup && <div className="dark-background" onClick={this.props.toggleShowPopup} />}
                <div className={`image-popup ${this.props.showPopup ? "scale-in-center" : "scale-out-center"}`} >
                    {this.props.chosenImg}
                    {(this.props.enableEdit || this.props.enableDelete) &&
                        <div>
                            <div className="tool-bar-dark-background" />
                            <div className="tool-bar">
                                {this.props.enableEdit && !this.props.disabled && <label className="tool-bar-label" htmlFor={this.props.inputId}><img className="edit" src={require('../../imgs/edit.svg')} /></label>}
                                {this.props.enableDelete && !this.props.disabled && <img className="bin" src={require('../../imgs/bin.svg')} onClick={this.props.removeFile} />}
                            </div>
                        </div>}
                </div>
            </div>
        );
    }
}