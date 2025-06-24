// Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR API KEY HERE",
  authDomain: "grievance-cell-cad1a.firebaseapp.com",
  projectId: "grievance-cell-cad1a"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Set authentication persistence
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
  .catch(err => console.error("Auth persistence error:", err));

// Sign Up function
function signUp() {
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;

  if (!email || !password) {
    return alert('Please fill all fields');
  }

  auth.createUserWithEmailAndPassword(email, password)
    .then(() => window.location.href = 'grievance.html')
    .catch(err => {
      console.error("Signup error:", err);
      alert("Signup error: " + err.message);
    });
}

// Login function
function login() {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  if (!email || !password) {
    return alert('Please fill all fields');
  }

  auth.signInWithEmailAndPassword(email, password)
    .then(() => window.location.href = 'grievance.html')
    .catch(err => {
      console.error("Login error:", err);
      alert("Login error: " + err.message);
    });
}

// Enhanced Grievance submission
function submitGrievance() {
  const name = document.getElementById('name').value;
  const usn = document.getElementById('usn').value;
  const complaint = document.getElementById('complaint').value;
  const severity = document.getElementById('severity').value;

  if (!name || !usn || !complaint || !severity) {
    return alert('Please fill all fields');
  }

  const submitButton = document.querySelector('#submit-btn');
  const originalText = submitButton.textContent;
  submitButton.textContent = 'Submitting...';
  submitButton.disabled = true;

  const apiUrl = 'https://fabled-etching-459609-q7.uc.r.appspot.com/submit-grievance';

  fetch(apiUrl, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${auth.currentUser?.uid}` 
    },
    body: JSON.stringify({ 
      name, 
      usn, 
      complaint, 
      severity: parseInt(severity, 10)
    })
  })
  .then(async response => {
    submitButton.textContent = originalText;
    submitButton.disabled = false;

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Server error');
    }
    return response.json();
  })
  .then(data => {
    alert(data.message || 'Grievance submitted successfully!');
    document.getElementById('name').value = '';
    document.getElementById('usn').value = '';
    document.getElementById('complaint').value = '';
    document.getElementById('severity').value = '5';
    document.getElementById('severity-value').textContent = '5';
  })
  .catch(err => {
    console.error('Submission error:', err);
    alert('Error submitting grievance: ' + err.message);
    submitButton.textContent = originalText;
    submitButton.disabled = false;
  });
}
