import {HttpRequest} from '../services/http';
import {URL} from '../config';

export const UserController = {
  profile: id => {
    return HttpRequest.get(URL.api.userProfileView(id));
  }
}