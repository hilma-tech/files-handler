import React, { Component } from 'react';
import SingleFileUploaderView from '../single-file-uploader-view/SingleFileUploaderView';
import AudioUploader from '../../client/components/NewAudioUploader';
import TableInfo from './TableInfo.json';
import Consts from '../../consts/Consts.json';
import { isIOS, isSafari } from 'react-device-detect';
import 'react-h5-audio-player/src/styles.scss';

export default class AudioUploaderView extends Component {
    render() {
        return (
            <div className="uploadDisplay audioDisplay">
                <SingleFileUploaderView
                    type={Consts.FILE_TYPE_AUDIO}
                    uploader={<AudioUploader
                        uploadAudio
                        audioRecorder={(isIOS || isSafari) ? false : true}
                        name="audio"
                        deleteAudio={this.deleteAudio}
                        onChange={this.handleFileChange} />}
                    tableInfo={TableInfo}
                />
            </div>
        );
    }
}