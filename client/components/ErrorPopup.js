import React, { Component } from 'react';

export default class ErrorPopup extends Component {

    render() {
        return (
            <div className="error-popup">
                {this.props.showPopup && <div className="dark-background" />}
                <div className={`popup ${this.props.showPopup ? "scale-in-center" : "scale-out-center"}`} >
                    <h1>{this.props.message}</h1>
                    <h2>Try to choose another file</h2>
                    <button onClick={this.props.toggleShowPopup}>OK</button>
                </div>
            </div>
        );
    }
}