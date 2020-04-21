import React from 'react';
import SingleFileUploader from './single-file-uploader/SingleFileUploader';
import Consts from '../../consts/Consts.json';
import AudioRecorder from './AudioRecorder'
import AudioPlayer, { RHAP_UI } from 'react-h5-audio-player';
import Modal from 'react-responsive-modal';
import { blobToDataURL } from 'blob-util';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './NewAudioUploader.scss';

const customStyles = {
    content: {
        // top: '50%',
        // left: '50%',
        // right: 'auto',
        // bottom: 'auto',
        // marginRight: '-50%',
        // transform: 'translate(-50%, -50%)'
    }
};

export default class NewAudioUploader extends SingleFileUploader {

    constructor(props) {
        props = { ...props };
        props.type = Consts.FILE_TYPE_AUDIO;
        super(props);

        this.state = {
            isUserRecord: false,
            eventObj: { target: { name: this.props.name, value: null } },
            isAudioSaved: false,
            record: false,
            exitRecording: false
        };
    }

    readFileToBase64 = (fileInfo, isBlob) => {
        if (isBlob) {
            return new Promise((resolve, reject) => {
                blobToDataURL(fileInfo).then(function (res, err) {
                    if (res) {
                        resolve(res)
                    }
                    else {
                        reject(err)
                    }
                })
            });

        } else {
            return new Promise((resolve, reject) => {
                if (fileInfo) {

                    var FR = new FileReader();
                    FR.addEventListener("load", function (e) {
                        resolve(e.target.result);
                    });

                    FR.readAsDataURL(fileInfo);
                }

                else reject("no file");
            })
        }
    }

    deleteAudio = () => {
        this.props.deleteAudio();
        this.setState({ isUserRecord: false })
    }

    saveAudio = () => {
        this.setState({ isAudioSaved: true })
        this.props.onChange(this.state.eventObj);
    }

    onChangeAudio = async (e = null, recordedBlob, type) => {
        let file;
        let isBlob = false;
        if (e == null) {
            file = recordedBlob;
            isBlob = true;
        }
        else {
            file = e.target.files[0];
        }
        let base64String = await this.readFileToBase64(file, isBlob);

        let audioObj = {
            src: base64String,
            type: 'audio',
            title: this.props.title || "default_audio_title",
            category: this.props.category || "default_audio_category",
            description: this.props.description || "default_audio_description"
        };

        let eventObj = { target: { name: this.props.name, value: audioObj } }
        this.props.onChange(eventObj);
    }

    exitModal = () => {
        this.props.deleteAudio();
        this.setState({ isUserRecord: false, exitRecording: true })
    }

    openRecordingModal = () => {
        this.setState({ isUserRecord: true });
    }

    render() {
        return (
            this.props.audioSrc ?
                <div id="audioSavedDisplay" className="d-flex border border-light">
                    <AudioPlayer
                        showJumpControls={false}
                        src={this.props.audioSrc}
                        onPlay={e => console.log("onPlay")}
                        customAdditionalControls={
                            [
                                RHAP_UI.LOOP,
                                <div className="audioMsg clickAble" onClick={this.deleteAudio}>בטל הקלטה</div>
                            ]}
                    />
                </div>
                :
                <div id="buttonsDisplay">
                    {this.props.audioRecorder && !this.state.isUserRecord &&
                        <label className="recordAudio clickAble d-flex flex-row justify-content-center" onClick={this.openRecordingModal}>
                            <div>Record</div>
                            <FontAwesomeIcon icon={"microphone"} className="ml-2 h-100" color="##FFFFFF" />
                        </label>}

                    {this.props.uploadAudio && !this.state.isUserRecord &&
                        <label className="uploadAudio clickAble">
                            <input onChange={this.onChangeAudio} name="audio" required type="file" accept="audio/*" id="file" />
                            <div>Load file</div>
                            <FontAwesomeIcon icon={"upload"} color="##FFFFFF" className="ml-2 h-100"></FontAwesomeIcon>
                        </label>}

                    <Modal open={this.props.audioRecorder && this.state.isUserRecord} onClose={this.exitModal} style={customStyles} center>
                    {this.props.audioRecorder && this.state.isUserRecord &&
                        <div id="recordModal">
                            <p>מקליט</p>
                            <AudioRecorder onChangeAudio={this.onChangeAudio} exitRecording={this.state.exitRecording} />
                        </div>}
                    </Modal>
                </div>
        );
    }
}