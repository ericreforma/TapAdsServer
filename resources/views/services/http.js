import axios from 'axios';
import { API, TOKENIZED_API, API_RAW } from './api';
import { TOKEN } from '../config/variable';

let httpRequest;

export const HttpRequest = {
    get: (url) => {
        httpRequest = axios.create(TOKENIZED_API());
        return httpRequest.get(url);
    },
    post: (url, form = {}) => {
        httpRequest = axios.create(TOKENIZED_API());
        return httpRequest.post(url, form);
    }
};

export const RawHttpRequest = {
    get: (url) => {
        httpRequest = axios.create(API);
        return httpRequest.get(url);
    },
    post: (url, form = {}) => {
        httpRequest = axios.create(API_RAW());
        return httpRequest.post(url, form);
    }
};