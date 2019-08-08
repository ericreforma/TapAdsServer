import {USER_TYPE, TOKEN} from '../config/variable';

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