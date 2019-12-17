import { HttpRequest } from '../services/http';

export const CampaignController = {
  list: () => {
    return HttpRequest.get('/client/campaign/list');
  },
  requests: () => {
    return HttpRequest.get('/client/campaign/request');
  },
  changeStatus: (data) => {
    return HttpRequest.post('/client/campaign/request/update', data);
  },
  dashboard: cid => {
    return HttpRequest.get(`/client/campaign/dashboard/${cid}`)
  }
};