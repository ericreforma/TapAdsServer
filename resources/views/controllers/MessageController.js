import { HttpRequest } from '../services/http';

export const MessageController = {
  userList: () => {
    return HttpRequest.get('/client/message/list');
  },
  getNonConvoUsers: search => {
    return HttpRequest.get(`/client/message/nonConvoList/${search}`);
  },
  getMessages: id => {
    return HttpRequest.get(`/client/message/convo/${id}`);
  },
  sendMessage: form => {
    return HttpRequest.post('/client/message/save', form);
  }
};