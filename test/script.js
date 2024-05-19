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

// Reference to the workouts collection
const workoutsRef = db.collection('workouts');

// Function to edit a workout
function editWorkout(id, date, exercise, sets, reps) {
  document.getElementById('date').value = date;
  document.getElementById('exercise').value = exercise;
  document.getElementById('sets').value = sets;
  document.getElementById('reps').value = reps;
  document.getElementById('workoutForm').dataset.id = id;
}

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

  const workoutId = workoutForm.dataset.id;


if (workoutId) {
    // Update existing workout
    workoutsRef.doc(workoutId).update(newWorkout).then(() => {
      console.log('Workout updated!');
      workoutForm.reset(); // Clear the form
      delete workoutForm.dataset.id; // Remove edit 
       // Reset the date to today's date
      document.getElementById('date').value = formattedToday;
    }).catch((error) => {
      console.error('Error updating workout: ', error);
    });
  } else {
    // Add new workout
    workoutsRef.add(newWorkout).then(() => {
      console.log('Workout added!');
      workoutForm.reset(); // Clear the form
       // Reset the date to today's date
      document.getElementById('date').value = formattedToday;
    }).catch((error) => {
      console.error('Error adding workout: ', error);
    });
  }
});

// Display workouts
workoutsRef.onSnapshot((snapshot) => {
  const workoutList = document.getElementById('workoutList');
  workoutList.innerHTML = ''; // Clear previous data

  snapshot.forEach((doc) => {
    const workout = doc.data();
    const workoutItem = document.createElement('div');
    workoutItem.innerHTML = `
      <h3>${workout.exercise}</h3>
      <p>Date: ${workout.date}</p>
      <p>Sets: ${workout.sets}</p>
      <p>Reps: ${workout.reps}</p>
      <button onclick="editWorkout('${doc.id}', '${workout.date}', '${workout.exercise}', '${workout.sets}', '${workout.reps}')">Edit</button>
    `;
    workoutList.appendChild(workoutItem);
  });
});
