import React, { Component, Suspense } from 'react';
import Auth from '../../../auth/Auth'

export default class GetImg extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            img: {},
            done: false
        };
    }

    async componentDidMount() {
        let [res, err] = await (Auth.superAuthFetch(`/api/Images`, {
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            Method: "GET"
        }));
        if (err) return console.log("ERROR:", err);
        this.setState({ img: res, done: true });
    }

    render() {
        if (this.state.done) {
            return (
                <div>
                    {this.state.img[this.state.img.length - 1].multiplesizes ?
                        this.state.img[this.state.img.length - 1].multiplesizes.map((imgPath, key) => {
                            return <img src={imgPath} key={key} />})
                        :
                        <div>
                            <img src={this.state.img[this.state.img.length - 1].path} />
                        </div>}
                </div>
            );
        }
        return <div></div>
    }
}