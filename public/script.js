const firebaseConfig = {
  apiKey: "AIzaSyCwaQqwlODdrtpRFnwuX1QpQc8YPx1sL0s",
  authDomain: "nicks-training.firebaseapp.com",
  projectId: "nicks-training",
  storageBucket: "nicks-training.appspot.com",
  messagingSenderId: "587481127491",
  appId: "1:587481127491:web:ecb4743c767270fb2752f6",
  measurementId: "G-LCJ339QFBN"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

console.log("Script loaded and Firebase initialized.");

// Ensure session persistence
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
  .then(() => {
    console.log("Session persistence set to LOCAL.");
  })
  .catch((error) => {
    console.error("Error setting persistence:", error);
  });

// Handle sign-up form submission
const signUpForm = document.getElementById('signUpForm');
signUpForm.addEventListener('submit', (event) => {
  event.preventDefault();
  console.log("Sign-up form submitted.");

  const name = document.getElementById('name').value;
  const email = document.getElementById('signUpEmail').value;
  const password = document.getElementById('signUpPassword').value;

  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log('User created:', user);
      return user.updateProfile({
        displayName: name
      }).then(() => {
        // Store user data in Firestore
        return db.collection('users').doc(user.uid).set({
          name: name,
          email: email
        });
      });
    })
    .then(() => {
      console.log('User signed up and data stored in Firestore');
      document.getElementById('signUpForm').reset();
      window.location.href = "main.html"; // Redirect to main.html
    })
    .catch((error) => {
      console.error('Error signing up:', error);
      alert('Error signing up: ' + error.message); // Display error message to the user
    });
});

// Handle sign-in form submission
const signInForm = document.getElementById('signInForm');
signInForm.addEventListener('submit', (event) => {
  event.preventDefault();
  console.log("Sign-in form submitted.");

  const email = document.getElementById('signInEmail').value;
  const password = document.getElementById('signInPassword').value;

  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log("Signed in user ID (UID):", user.uid);
      document.getElementById('signInForm').reset();
      window.location.href = "main.html"; // Redirect to main.html
    })
    .catch((error) => {
      console.error('Error signing in:', error);
      alert('Error signing in: ' + error.message); // Display error message to the user
    });
});
