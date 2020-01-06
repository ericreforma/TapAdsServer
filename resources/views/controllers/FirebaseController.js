import * as firebase from 'firebase/app';
import '@firebase/messaging';

import { HttpRequest } from '../services/http';
import { getUserUniqueID } from '../storage';

export const FirebaseController = {
  init: async (successCallback, errorCallback) => {
    try {
      const messaging = firebase.messaging();
      await messaging.requestPermission();
      const fcmToken = await messaging.getToken();
      if(fcmToken) {
        console.log('Success: Firebase User authorized');
        FirebaseController.updateToken(fcmToken, successCallback, errorCallback);
      } else {
        console.log('Failed: No firebase token received');
        errorCallback();
      }
    } catch (error) {
      console.log('Failed: Firebase User Unauthorized');
      errorCallback();
    }
  },
  updateToken: (token, successCallback = false, errorCallback = false) => {
    const uniqueId = getUserUniqueID();
    HttpRequest.post('/client/firebase/update', { uniqueId, token })
    .then(() => {
      console.log('Firebase Token Updated');
      if(successCallback) successCallback();
    })
    .catch(error => {
      console.log(error.response);
      if(errorCallback) errorCallback();
    });
  }
};