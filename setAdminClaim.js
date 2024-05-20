const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');  // Replace with the path to your service account key

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const uid = 'Kfm4XVeI5jaAYyTia0YhI0uXE5J2';  // Replace with your user ID

admin.auth().setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log('Custom claims set for user:', uid);
  })
  .catch(error => {
    console.error('Error setting custom claims:', error);
  });
