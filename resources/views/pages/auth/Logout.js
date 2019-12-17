import React, { Component } from 'react';
import { Loader } from '../../components';
import { removeLocalStorage } from '../../storage';
import { HttpRequest } from '../../services/http';
import { URL } from '../../config';

export default class LogoutLayout extends Component {
    componentDidMount = () => {
        HttpRequest.get(URL.api.auth.logout).then(res => {
            var clearLocalStorage = removeLocalStorage();
            if(clearLocalStorage) {
                this.props.history.push(URL.login);
            }
        }).catch(error => {
            console.log(error);
            // this.props.history.push(URL.login);
        });
    }

    render() {
        return (
            <div
                style={{
                    width: '100vw',
                    height: '100vh',
                    justifyContent: 'center',
                    alignItems: 'center',
                    display: 'flex'
                }}
            >
                <Loader type="puff" />
            </div>
        );
    }
}
