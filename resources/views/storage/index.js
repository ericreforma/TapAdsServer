import { KEYS } from '../config';

var CryptoJS = require("crypto-js");

export const storeToken = (token) => {
    const encryptToken = encryptStringData(token);
    const date = new Date();
    const userUniqueID = date.getTime();
    localStorage.setItem('client_token', encryptToken);
    localStorage.setItem('client_uniqueID', userUniqueID);
};

export const getToken = () => {
    const token = localStorage.getItem('client_token');
    if(!token) {
        return null;
    } else {
        const decryptToken = decryptStringData(token);
        return decryptToken;
    }
}

export const getUserUniqueID = () => {
    const uniqueId = localStorage.getItem('client_uniqueID');
    if(!uniqueId) {
        return null;
    } else {
        return uniqueId;
    }
}

export const removeLocalStorage = () => {
    localStorage.clear();
    return true;
}

const encryptStringData = (data) => {
    return CryptoJS.AES.encrypt(data, KEYS.storage);
};

const decryptStringData = (data) => {
    var bytes  = CryptoJS.AES.decrypt(data.toString(), KEYS.storage),
        plaintext = bytes.toString(CryptoJS.enc.Utf8);

    return plaintext;
};