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
    const api = API,
        token = localStorage.getItem('client_token');
    
    api.headers.Authorization = `Bearer ${token}`;
    return api;
};

export { API, TOKENIZED_API };