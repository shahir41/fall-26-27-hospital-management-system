
function validateLogin() {
  let username = document.getElementById("username").value.trim();
  let password = document.getElementById("password").value;
  let isValid = true;

  clearErrors(["username", "password"]);
  hideMessage("loginMessage");

  if (isEmpty(username)) {
    showError("username", "Please enter your username or email.");
    isValid = false;
  }
  if (isEmpty(password)) {
    showError("password", "Please enter your password.");
    isValid = false;
  }

  if (isValid === false) { return false; }

  let foundUser = null;
  for (let i = 0; i < users.length; i++) {
    let user = users[i];
    let sameName = user.username.toLowerCase() === username.toLowerCase();
    let sameEmail = user.email.toLowerCase() === username.toLowerCase();
    if (sameName || sameEmail) {
      foundUser = user;
    }
  }

  if (foundUser === null || foundUser.password !== password) {
    showMessage("loginMessage", "Wrong username or password. Please try again.", "error");
    return false;
  }

  if (foundUser.status === "Blocked") {
    showMessage("loginMessage", "This account is blocked. Contact support.", "error");
    return false;
  }

  let form = document.getElementById("loginForm");
  switch (foundUser.role) {
    case "Admin":
      form.action = "admin.html";
      break;
    case "Doctor":
      form.action = "doctor.html";
      break;
    case "Receptionist":
      form.action = "receptionist.html";
      break;
    case "Patient":
      form.action = "patient.html";
      break;
  }

  return true;
}

function togglePassword() {
  let passwordInput = document.getElementById("password");
  if (document.getElementById("showPassword").checked) {
    passwordInput.type = "text";
  } else {
    passwordInput.type = "password";
  }
}

function fillDemo(username, password) {
  document.getElementById("username").value = username;
  document.getElementById("password").value = password;
  clearErrors(["username", "password"]);
  hideMessage("loginMessage");
}
