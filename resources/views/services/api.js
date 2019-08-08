import {TOKEN} from '../config/variable';

var baseURL = '/api',
    timeout = 30000,
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    };

const API = {
    baseURL,
    timeout,
    headers
};

const TOKENIZED_API = () => {
    const api = API;
    
    api.headers.Authorization = `Bearer ${TOKEN}`;
    return api;
};

export { API, TOKENIZED_API };