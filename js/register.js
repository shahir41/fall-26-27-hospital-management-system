function validateRegister() {
  let fullname = document.getElementById("fullname").value.trim();
  let dob = document.getElementById("dob").value;
  let gender = document.getElementById("gender").value;
  let email = document.getElementById("email").value.trim();
  let phone = document.getElementById("phone").value.trim();
  let address = document.getElementById("address").value.trim();
  let password = document.getElementById("password").value;
  let confirmPassword = document.getElementById("confirmPassword").value;
  let termsChecked = document.getElementById("terms").checked;

  let fields = [
    "fullname", "dob", "gender", "email", "phone",
    "address", "password", "confirmPassword", "terms"
  ];
  clearErrors(fields);

  let isValid = true;

  if (fullname.length < 3) {
    showError("fullname", "Full name must be at least 3 characters.");
    isValid = false;
  }

  if (dob === "") {
    showError("dob", "Please select your date of birth.");
    isValid = false;
  }

  if (gender === "") {
    showError("gender", "Please select a gender.");
    isValid = false;
  }

  if (email === "" || email.indexOf("@") === -1 || email.indexOf(".") === -1) {
    showError("email", "Please enter a valid email address.");
    isValid = false;
  }

  if (!/^01[3-9][0-9]{8}$/.test(phone)) {
    showError("phone", "Enter a valid 11-digit Bangladeshi mobile number (01XXXXXXXXX).");
    isValid = false;
  }

  if (address === "") {
    showError("address", "Please enter your present address.");
    isValid = false;
  }

  if (password.length < 8) {
    showError("password", "Password must be at least 8 characters.");
    isValid = false;
  }

  if (confirmPassword === "") {
    showError("confirmPassword", "Please confirm your password.");
    isValid = false;
  } else if (password !== confirmPassword) {
    showError("confirmPassword", "Passwords do not match.");
    isValid = false;
  }

  if (!termsChecked) {
    showError("terms", "You must agree to the Terms and Conditions.");
    isValid = false;
  }

  if (!isValid) {
    return false;
  }

  let newUser = {
    id: nextId("PAT", users),
    name: fullname,
    username: email,
    password: password,
    email: email,
    role: "Patient",
    status: "Active"
  };

  users.push(newUser);
  alert("Registration successful! Patient account " + newUser.id + " created in current page memory.");
  return true;
}