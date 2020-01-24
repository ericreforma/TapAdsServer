import React, { Component } from 'react';
import { Loader } from '../../components';
import { removeLocalStorage, getUserUniqueID } from '../../storage';
import { HttpRequest } from '../../services/http';
import { URL } from '../../config';

export default class LogoutLayout extends Component {
    componentDidMount = () => {
        const logoutUrl = `${URL.api.auth.logout}/${getUserUniqueID()}`;
        HttpRequest.get(logoutUrl).then(res => {
            var clearLocalStorage = removeLocalStorage();
            if(clearLocalStorage) {
                this.props.history.push(URL.login);
            }
        }).catch(error => {
            console.log(error);
            var clearLocalStorage = removeLocalStorage();
            if(clearLocalStorage) {
                this.props.history.push(URL.login);
            }
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
