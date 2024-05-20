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
const db = firebase.firestore();
const auth = firebase.auth();

let currentUser = null;

auth.onAuthStateChanged((user) => {
  if (user) {
    currentUser = user;
    console.log("User is signed in:", user);
    loadWorkouts();
  } else {
    console.log("No user is signed in.");
    window.location.href = "index.html"; // Redirect to index.html if not signed in
  }
});

// Handle sign-out
const signOutBtn = document.getElementById('signOutBtn');
signOutBtn.addEventListener('click', () => {
  auth.signOut().then(() => {
    currentUser = null;
    console.log("User signed out.");
    window.location.href = "index.html"; // Redirect to index.html on sign out
  }).catch((error) => {
    console.error('Error signing out:', error);
  });
});

// Handle workout form submission
const workoutForm = document.getElementById('workoutForm');
workoutForm.addEventListener('submit', (event) => {
  event.preventDefault();
  console.log("Workout form submitted.");

  const date = document.getElementById('date').value;
  const exercise = document.getElementById('exercise').value;
  const sets = document.getElementById('sets').value;
  const reps = document.getElementById('reps').value;
  const weight = document.getElementById('weight').value;

  const newWorkout = {
    date: date,
    exercise: exercise,
    sets: sets,
    reps: reps,
    weight: weight, // Add weight to the workout data
    userId: currentUser.uid // Ensure workout is associated with the current user
  };

  const workoutId = workoutForm.dataset.id;

  if (workoutId) {
    // Update existing workout
    db.collection('workouts').doc(workoutId).update(newWorkout).then(() => {
      console.log('Workout updated!');
      workoutForm.reset();
      delete workoutForm.dataset.id;
      document.getElementById('date').value = new Date().toISOString().split('T')[0];
    }).catch((error) => {
      console.error('Error updating workout:', error);
      alert('Error updating workout: ' + error.message); // Display error message to the user
    });
  } else {
    // Add new workout
    db.collection('workouts').add(newWorkout).then(() => {
      console.log('Workout added!');
      workoutForm.reset();
      document.getElementById('date').value = new Date().toISOString().split('T')[0];
    }).catch((error) => {
      console.error('Error adding workout:', error);
      alert('Error adding workout: ' + error.message); // Display error message to the user
    });
  }
});

// Function to load workouts for the current user
function loadWorkouts(filter = {}) {
  if (currentUser) {
    console.log("Loading workouts for user ID:", currentUser.uid);
    let query = db.collection('workouts').where('userId', '==', currentUser.uid);

    if (filter.date) {
      query = query.where('date', '==', filter.date);
    }
    if (filter.exercise) {
      query = query.where('exercise', '==', filter.exercise);
    }

    query.onSnapshot((snapshot) => {
      const workoutTableBody = document.getElementById('workoutTableBody');
      workoutTableBody.innerHTML = '';

      snapshot.forEach((doc) => {
        const workout = doc.data();
        const workoutRow = document.createElement('tr');
        workoutRow.innerHTML = `
          <td><input type="checkbox" class="selectWorkout" data-id="${doc.id}"></td>
          <td><input type="date" value="${workout.date}" onchange="updateField('${doc.id}', 'date', this.value)"></td>
          <td><input type="text" value="${workout.exercise}" onchange="updateField('${doc.id}', 'exercise', this.value)"></td>
          <td><input type="number" value="${workout.sets}" onchange="updateField('${doc.id}', 'sets', this.value)"></td>
          <td><input type="number" value="${workout.reps}" onchange="updateField('${doc.id}', 'reps', this.value)"></td>
          <td><input type="number" value="${workout.weight}" onchange="updateField('${doc.id}', 'weight', this.value)"></td>
          <td>
            <button class="edit-btn" onclick="editWorkout('${doc.id}', '${workout.date}', '${workout.exercise}', '${workout.sets}', '${workout.reps}', '${workout.weight}')">Edit</button>
            <button class="delete-btn" onclick="deleteWorkout('${doc.id}')">Delete</button>
          </td>
        `;
        workoutTableBody.appendChild(workoutRow);
      });
    });
  }
}

// Function to edit a workout
function editWorkout(id, date, exercise, sets, reps, weight) {
  document.getElementById('date').value = date;
  document.getElementById('exercise').value = exercise;
  document.getElementById('sets').value = sets;
  document.getElementById('reps').value = reps;
  document.getElementById('weight').value = weight; // Populate weight input field
  document.getElementById('workoutForm').dataset.id = id;
}

// Function to delete a workout
function deleteWorkout(id) {
  db.collection('workouts').doc(id).delete().then(() => {
    console.log('Workout deleted!');
  }).catch((error) => {
    console.error('Error deleting workout:', error);
    alert('Error deleting workout: ' + error.message); // Display error message to the user
  });
}

// Function to update a field in Firestore
function updateField(id, field, value) {
  const updateData = {};
  updateData[field] = value;
  db.collection('workouts').doc(id).update(updateData).then(() => {
    console.log('Field updated!');
  }).catch((error) => {
    console.error('Error updating field:', error);
    alert('Error updating field: ' + error.message); // Display error message to the user
  });
}

// Handle filter form submission
const filterForm = document.getElementById('filterForm');
filterForm.addEventListener('submit', (event) => {
  event.preventDefault();
  console.log("Filter form submitted.");

  const filterDate = document.getElementById('filterDate').value;
  const filterExercise = document.getElementById('filterExercise').value;

  const filter = {};
  if (filterDate) {
    filter.date = filterDate;
  }
  if (filterExercise) {
    filter.exercise = filterExercise;
  }

  loadWorkouts(filter);
});

// Handle copying selected workouts
const copySelectedBtn = document.getElementById('copySelectedBtn');
copySelectedBtn.addEventListener('click', () => {
  const selectedWorkouts = document.querySelectorAll('.selectWorkout:checked');
  selectedWorkouts.forEach((checkbox) => {
    const workoutId = checkbox.dataset.id;
    db.collection('workouts').doc(workoutId).get().then((doc) => {
      const workout = doc.data();
      const newWorkout = {
        ...workout,
        date: new Date().toISOString().split('T')[0] // Set to today's date
      };
      db.collection('workouts').add(newWorkout).then(() => {
        console.log('Workout copied!');
      }).catch((error) => {
        console.error('Error copying workout:', error);
        alert('Error copying workout: ' + error.message); // Display error message to the user
      });
    });
  });
});

// Set default date to today's date
window.onload = function() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const dd = String(today.getDate()).padStart(2, '0');
  const formattedToday = `${yyyy}-${mm}-${dd}`;
  document.getElementById('date').value = formattedToday;
};
