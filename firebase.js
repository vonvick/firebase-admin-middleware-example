require('dotenv').config();
import firebase from 'firebase-admin';
var serviceAccount = require('./firebase-service-account.json');

export default firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL
})
