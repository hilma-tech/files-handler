import React, { Component } from 'react';
import Auth from '../../../auth/Auth';
import ImageUploader from '../../client/components/ImageUploader.jsx';
import MultiFilesUploader from '../../client/components/multi-files-uploader/MultiFilesUploader';
import './CreateGame.scss';

export default class CreateGame extends Component {

    constructor(props) {
        super(props);
        this.state = {
            uploadedImages: null,
            isSubmitDisabled: true,
            isInputDisabled: false
        };
    }

    onInputChange = (fileEvent) => {
        let name = (fileEvent.target && fileEvent.target.name) || null;
        let value = (fileEvent.target && fileEvent.target.value) || null;
        let isSubmitDisabled = true;
        if (isSubmitDisabled && value) isSubmitDisabled = false;
        this.setState({ [name]: value, isSubmitDisabled });
    }

    getGameData = () => {
        const fieldsToSave = ["title", "description", "imgId", "imageId"];

        let fieldsToSaveObj = {};
        for (let field of fieldsToSave) {
            fieldsToSaveObj[field] = this.state[field];
        }

        return fieldsToSaveObj;
    }

    createGame = async () => {
        this.setState({ isSubmitDisabled: true, isInputDisabled: true });

        let newGame = this.getGameData();

        let [res, err] = await Auth.superAuthFetch('/api/Games/createNewGame', {
            method: 'POST',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify({ newGameData: newGame })
        });

        if (err) return console.log("ERR:", err);

        await this.previewImg();
    };

    previewImg = async () => {
        let filter = "filter[order]=id DESC&filter[limit]=1";
        let [res, err] = await Auth.superAuthFetch('/api/Images?' + filter);

        if (err) return console.log("ERR:", err);

        this.setState({ uploadedImage: res[0] });
    }

    render() {
        return (
            <div className="create-game-sample">

                <h2>Create a new game</h2>

                <div className="form">
                    <div className="row">
                        <div className="col">
                            <div className="field">
                                <label>Title:</label>
                                <input
                                    onChange={this.onInputChange}
                                    name="title"
                                    type="text"
                                    disabled={this.state.isInputDisabled}
                                />
                            </div>

                            <div className="field">
                                <label>Description:</label>
                                <textarea
                                    onChange={this.onInputChange}
                                    name="description"
                                    disabled={this.state.isInputDisabled}
                                />
                            </div>
                        </div>

                        <div className="col">
                            <ImageUploader
                                category="games-cover-images" // image is saved into public/images/[category]
                                name="imgId"
                                title="cover-image"
                                theme="basic-theme"
                                label="Choose a cover image"
                                onChange={this.onInputChange}
                                disabled={this.state.isInputDisabled}
                            />
                        </div>
                    </div>

                    <MultiFilesUploader
                        name="imageId" // keyToSaveImgId
                        title="my-images"
                        category="games-images"
                        label="Drop images of the game's process"
                        onChange={this.onInputChange}
                        disabled={this.state.isInputDisabled}
                    />
                </div>

                <button onClick={this.createGame} disabled={this.state.isSubmitDisabled}>Submit</button>

                <p className="explanation">
                    <strong>Note:</strong> In this example the Submit button creates a new game and uploads all the chosen images to Images model.<br />
                    It saves the reference of cover-image id at imgId field in games model.<br />
                    It saves the references of game-process-images at games-images model.</p>

                {this.state.uploadedImage && <UploadedImage {...this.state.uploadedImage} />}
            </div >
        );
    }
}

const UploadedImage = (props) => {
    return (
        <div className='uploaded-image'>
            <div>
                <img src={props.path} alt={props.title} title={props.title} />
                <label>{props.description}</label>
            </div>
        </div>
    );
}