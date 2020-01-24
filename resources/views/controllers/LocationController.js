import {HttpRequest} from '../services/http';

export const LocationController = {
  user: {
    live: params => {
      return HttpRequest.get(`/client/user/location/live${params}`);
    }
  }
};