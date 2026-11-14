function validateRegister() {
  let fullnameEl = document.getElementById("fullname");
  let dobEl = document.getElementById("dob");
  let genderEl = document.getElementById("gender");
  let emailEl = document.getElementById("email");
  let phoneEl = document.getElementById("phone");
  let addressEl = document.getElementById("address");
  let passwordEl = document.getElementById("password");
  let confirmPasswordEl = document.getElementById("confirmPassword");

  let fullname = fullnameEl ? fullnameEl.value.trim() : "";
  let dob = dobEl ? dobEl.value : "";
  let gender = genderEl ? genderEl.value : "";
  let email = emailEl ? emailEl.value.trim() : "";
  let phone = phoneEl ? phoneEl.value.trim() : "";
  let address = addressEl ? addressEl.value.trim() : "";
  let password = passwordEl ? passwordEl.value : "";
  let confirmPassword = confirmPasswordEl ? confirmPasswordEl.value : "";

  if (fullname === "" || dob === "" || gender === "" || email === "" || phone === "" || address === "" || password === "") {
    alert("Please fill all required fields.");
    return false;
  }

  if (password.length < 8) {
    alert("Password must be at least 8 characters.");
    return false;
  }

  if (password !== confirmPassword) {
    alert("Passwords do not match!");
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
