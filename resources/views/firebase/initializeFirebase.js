import * as firebase from 'firebase/app';
import '@firebase/messaging';

import { HttpRequest } from '../services/http';
import { getUserUniqueID } from '../storage';

export const initializeFirebase = () => {
  if (!firebase.apps.length) {
    firebase.initializeApp({ 
      apiKey: "AIzaSyCN7zQyFwRnX0z_OSCrcLgueGaQg3MBRQk",
      authDomain: "tapads-f1fed.firebaseapp.com",
      databaseURL: "https://tapads-f1fed.firebaseio.com",
      projectId: "tapads-f1fed",
      storageBucket: "tapads-f1fed.appspot.com",
      messagingSenderId: "712250957936",
      appId: "1:712250957936:web:6560a3b1143df0029cd4b5",
      measurementId: "G-5J6T9F7VB6"
    });

    if('serviceWorker' in navigator)
      navigator.serviceWorker
      .register('./firebase/messaging-sw.js')
      .then(registration => {
        firebase.messaging().useServiceWorker(registration);
      });
  }
}

export const FirebaseFunction = {
  init: async (successCallback, errorCallback) => {
    try {
      const messaging = firebase.messaging();
      await messaging.requestPermission();
      const fcmToken = await messaging.getToken();
      if(fcmToken) {
        console.log('Success: Firebase User authorized');
        FirebaseFunction.updateToken(fcmToken, successCallback, errorCallback);
      } else {
        console.log('Failed: No firebase token received');
        errorCallback('Failed: No firebase token received');
      }
    } catch (error) {
      console.log('Failed: Firebase User Unauthorized');
      errorCallback('Failed: Firebase User Unauthorized');
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

export const askForPermissioToReceiveNotifications = async () => {
  try {
    const messaging = firebase.messaging();
    await messaging.requestPermission();
    const token = await messaging.getToken();
    console.log('token do usuário:', token);
    
    return token;
  } catch (error) {
    console.error(error);
  }
}