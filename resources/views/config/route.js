import {USER_TYPE, TOKEN} from '../config/variable';

const basePath = '/TapAdsServer/public';
const STORAGE_URL = `${basePath}/storage`

export const websocketURI = {
    chat: {
        client: {
            message: () => {
                return `/chat/authentication?token=${TOKEN}&userType=${USER_TYPE.client}`
            }
        }
    }
};

export const websocketEvents = {
    chat: {
        ON_CONNECT: 'connect',
        ONLINE_USERS: 'online users',
        ONLINE_USER: 'online user',
        NEW_MESSAGE: 'new message',
        DC_USER: 'disconnected user'
    }
};

export const URL_ROUTES = {
    basePath,
    STORAGE_URL,
    dashboard: `/dashboard`,
    login: `/login`,
    signup: `/signup`,
    logout: `/logout`,
    termsAndCondition: {
        privacyPolicy: '/termsAndCondition/privacyPolicy',
        termsOfUse: '/termsAndCondition/termsOfUse'
    }
};