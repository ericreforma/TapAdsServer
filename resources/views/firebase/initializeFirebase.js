import * as firebase from 'firebase/app';
import '@firebase/messaging';

export const initializeFirebase = () => {
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