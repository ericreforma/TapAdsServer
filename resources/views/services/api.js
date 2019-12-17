import { URL } from '../config/route';
import { TOKEN } from '../config/variable';

var baseURL = `${URL.basePath}/api`,
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

const API_RAW = () => {
    var csrf = document.head.querySelector('meta[name="csrf-token"]');
    const api = API;

    api.headers['X-CSRF-TOKEN'] = csrf.content;
    return api;
};

const TOKENIZED_API = () => {
    const api = API;
    
    api.headers.Authorization = `Bearer ${TOKEN}`;
    return api;
};

export { API, API_RAW, TOKENIZED_API };