import {HttpRequest} from '../services/http';

export const DashboardController = {
  data: () => {
    return HttpRequest.get('/client/dashboard');
  },
  graph: form => {
    return HttpRequest.post('/client/dashboard/graph', form)
  }
};