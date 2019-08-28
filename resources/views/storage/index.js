import config from '../config';

var CryptoJS = require("crypto-js");

export const storeToken = (token) => {
    var encryptToken = encryptStringData(token);
    localStorage.setItem('client_token', encryptToken);
};

export const getToken = () => {
    var token = localStorage.getItem('client_token');
    if(!token) {
        return null;
    } else {
        var decryptToken = decryptStringData(token);
        return decryptToken;
    }
}

export const removeLocalStorage = () => {
    localStorage.clear();
    return true;
}

const encryptStringData = (data) => {
    return CryptoJS.AES.encrypt(data, config.keys.storageKey);
};

const decryptStringData = (data) => {
    var bytes  = CryptoJS.AES.decrypt(data.toString(), config.keys.storageKey),
        plaintext = bytes.toString(CryptoJS.enc.Utf8);

    return plaintext;
};