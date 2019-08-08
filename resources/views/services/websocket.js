import io from 'socket.io-client';
import { websocketURI, websocketEvents } from '../config/route';

const baseURL = 'http://127.0.0.1:3000';

let { chat } = websocketEvents,
    socket;

export const Socket = {
    connect: () => {
        var { client } = websocketURI.chat;
        socket = io(baseURL + client.message());
        return socket;
    },
    onConnect: (websocket, callback) => {
        websocket.on(chat.ON_CONNECT, () => callback());
    },
    getOnlineUsers: (websocket, callback) => {
        websocket.on(chat.ONLINE_USERS, data => callback(data));
    },
    newOnlineUser: (websocket, callback) => {
        websocket.on(chat.ONLINE_USER, data => callback(data));
    },
    newMessage: (websocket, callback) => {
        websocket.on(chat.NEW_MESSAGE, data => callback(data));
    },
    disconnectedUser: (websocket, callback) => {
        websocket.on(chat.DC_USER, data => callback(data));
    }
}