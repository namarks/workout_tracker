// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCwaQqwlODdrtpRFnwuX1QpQc8YPx1sL0s",
  authDomain: "nicks-training.firebaseapp.com",
  projectId: "nicks-training",
  storageBucket: "nicks-training.appspot.com",
  messagingSenderId: "587481127491",
  appId: "1:587481127491:web:ecb4743c767270fb2752f6",
  measurementId: "G-LCJ339QFBN"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const analytics = firebase.analytics();
const workoutsRef = db.collection('workouts');

// Set default date to today's date
window.onload = function() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const dd = String(today.getDate()).padStart(2, '0');
  const formattedToday = `${yyyy}-${mm}-${dd}`;
  document.getElementById('date').value = formattedToday;
};

// Handle form submission
const workoutForm = document.getElementById('workoutForm');
workoutForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const date = document.getElementById('date').value;
  const exercise = document.getElementById('exercise').value;
  const sets = document.getElementById('sets').value;
  const reps = document.getElementById('reps').value;

  const newWorkout = {
    date: date,
    exercise: exercise,
    sets: sets,
    reps: reps
  };

   // ** Log the event to analytics **
  analytics.logEvent('workout_logged', { // NEW: Log event
    date: date,
    exercise: exercise,
    sets: sets,
    reps: reps
  });

  const workoutId = workoutForm.dataset.id;

  if (workoutId) {
    // Update existing workout
    workoutsRef.doc(workoutId).update(newWorkout).then(() => {
      console.log('Workout updated!');
      workoutForm.reset(); // Clear the form
      delete workoutForm.dataset.id; // Remove edit mode
      document.getElementById('date').value = new Date().toISOString().split('T')[0]; // Reset date to today
    }).catch((error) => {
      console.error('Error updating workout: ', error);
    });
  } else {
    // Add new workout
    workoutsRef.add(newWorkout).then(() => {
      console.log('Workout added!');
      workoutForm.reset(); // Clear the form
      document.getElementById('date').value = new Date().toISOString().split('T')[0]; // Reset date to today
    }).catch((error) => {
      console.error('Error adding workout: ', error);
    });
  }
});

// Function to edit a workout
function editWorkout(id, date, exercise, sets, reps) {
  document.getElementById('date').value = date;
  document.getElementById('exercise').value = exercise;
  document.getElementById('sets').value = sets;
  document.getElementById('reps').value = reps;
  document.getElementById('workoutForm').dataset.id = id;
}

// Function to delete a workout
function deleteWorkout(id) {
  workoutsRef.doc(id).delete().then(() => {
    console.log('Workout deleted!');
  }).catch((error) => {
    console.error('Error deleting workout: ', error);
  });
}

// Display workouts
workoutsRef.onSnapshot((snapshot) => {
  const workoutTableBody = document.getElementById('workoutTableBody');
  workoutTableBody.innerHTML = ''; // Clear previous data

  snapshot.forEach((doc) => {
    const workout = doc.data();
    const workoutRow = document.createElement('tr');
    workoutRow.innerHTML = `
      <td><input type="date" value="${workout.date}" onchange="updateField('${doc.id}', 'date', this.value)"></td>
      <td><input type="text" value="${workout.exercise}" onchange="updateField('${doc.id}', 'exercise', this.value)"></td>
      <td><input type="number" value="${workout.sets}" onchange="updateField('${doc.id}', 'sets', this.value)"></td>
      <td><input type="number" value="${workout.reps}" onchange="updateField('${doc.id}', 'reps', this.value)"></td>
      <td>
        <button class="edit-btn" onclick="editWorkout('${doc.id}', '${workout.date}', '${workout.exercise}', '${workout.sets}', '${workout.reps}')">Edit</button>
        <button class="delete-btn" onclick="deleteWorkout('${doc.id}')">Delete</button>
      </td>
    `;
    workoutTableBody.appendChild(workoutRow);
  });
});

// Function to update a field in Firestore
function updateField(id, field, value) {
  const updateData = {};
  updateData[field] = value;
  workoutsRef.doc(id).update(updateData).then(() => {
    console.log('Field updated!');
  }).catch((error) => {
    console.error('Error updating field: ', error);
  });
}
