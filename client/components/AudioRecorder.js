import React, { Component } from 'react';
import { ReactMic } from 'react-mic';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


export default class AudioRecorder extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            record: false,
            audioSrc: null,
            minutesLabel: 0,
            secondsLabel: 0,
            totalSeconds: 0
        }
    }
    componentWillReceiveProps(nextProps) {
        console.log("this.state. componentWillReceiveProps", nextProps.exitRecording)
    }

    componentWillMount() {
        setInterval(this.setTime, 1000);
    }

    startRecording = () => {
        this.setState(prevState => ({
            record: !prevState.record
        }));
    }

    stopRecording = () => {
        this.setState({
            record: false
        });
    }



    onStop = async (recordedBlob) => {
        console.log("this.props.exitRecording", this.props.exitRecording)
        if (!this.props.exitRecording)
            await this.props.onChangeAudio(null, recordedBlob.blob, recordedBlob.blob.type);
    }


    setTime = () => {
        if (this.state.record) {
            this.setState({ totalSeconds: this.state.totalSeconds + 1 })
            let second = this.pad(this.state.totalSeconds % 60);
            let minutes = this.pad(parseInt(this.state.totalSeconds / 60));
            this.setState({ secondsLabel: second, minutesLabel: minutes })
        }
    }

    pad = (val) => {
        let valString = val + "";
        if (valString.length < 2) {
            return "0" + valString;
        } else {
            return valString;
        }
    }

    render() {
        return (
            <div id="audioRecorder">
                <ReactMic
                    record={this.state.record}
                    className="no-wave"
                    onStop={this.onStop}
                />
                {this.state.record ?
                    <div className="Btn">
                        <FontAwesomeIcon icon="stop-circle" onClick={this.stopRecording} className="btnIcon clickAble" />
                    </div>

                    :
                    <div className="Btn">
                        <FontAwesomeIcon icon="play-circle" onClick={this.startRecording} className="btnIcon clickAble" />
                    </div>
                }
                <div id="timer">{this.state.minutesLabel == 0 ? "00" : this.state.minutesLabel}:{this.state.secondsLabel == 0 ? "00" : this.state.secondsLabel} </div>

            </div>
        );
    }
}