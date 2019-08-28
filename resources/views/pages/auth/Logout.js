import React, { Component } from 'react';
import { Loader } from '../../components';
import { removeLocalStorage } from '../../storage';
import { URL_ROUTES } from '../../config/route';
import { HttpRequest } from '../../services/http';
import config from '../../config';

export default class LogoutLayout extends Component {
    componentDidMount = () => {
        HttpRequest.get(config.api.auth.logout).then(res => {
            var clearLocalStorage = removeLocalStorage();
            if(clearLocalStorage) {
                this.props.history.push(URL_ROUTES.login);
            }
        }).catch(error => {
            console.log(error);
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
