const sections = ["statsSection", "usersSection", "ambulanceSection", "reviewsSection"];
let editUserIndex = -1;

function escapeHtml(text) {
  return String(text === undefined || text === null ? "" : text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
function generateReport() {
  let roleCounts = {};
  let appointmentCounts = {};

  let patientCount = 0;
  let doctorCount = 0;
  let receptionistCount = 0;
  let activeUserCount = 0;

  for (let i = 0; i < users.length; i++) {
    let user = users[i];
    let role = user.role || "Unknown";
    roleCounts[role] = (roleCounts[role] || 0) + 1;

    if (user.role === "Patient") patientCount++;
    if (user.role === "Doctor") doctorCount++;
    if (user.role === "Receptionist") receptionistCount++;
    if (user.status === "Active") activeUserCount++;
  }

  let pendingAppointments = 0;
  for (let i = 0; i < appointments.length; i++) {
    let appointment = appointments[i];
    let status = appointment.status || "Unspecified";
    appointmentCounts[status] = (appointmentCounts[status] || 0) + 1;
    if (status === "Pending" || status === "Scheduled") {
      pendingAppointments++;
    }
  }

  setStatText("statPatients", patientCount);
  setStatText("statDoctors", doctorCount);
  setStatText("statReceptionists", receptionistCount);
  setStatText("statAppointments", appointments.length);
  setStatText("statPending", pendingAppointments);
  setStatText("statAmbulances", ambulances.length);
  setStatText("statReviews", reviews.length);
  setStatText("statActiveUsers", activeUserCount);

  drawBarChart("roleChart", roleCounts);
  drawBarChart("appointmentChart", appointmentCounts);

  let reportTime = document.getElementById("reportTime");
  if (reportTime) {
    reportTime.textContent = "Generated at " + new Date().toLocaleString();
  }
}

function setStatText(id, value) {
  let element = document.getElementById(id);
  if (element) {
    element.textContent = value;
  }
}

function drawBarChart(chartId, data) {
  let container = document.getElementById(chartId);
  if (!container) return;

  let keys = [];
  for (let key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      keys.push(key);
    }
  }

  if (keys.length === 0) {
    container.innerHTML = "<p class='hint'>No data available.</p>";
    return;
  }

  let maxValue = 1;
  for (let i = 0; i < keys.length; i++) {
    let val = Number(data[keys[i]]) || 0;
    if (val > maxValue) {
      maxValue = val;
    }
  }

  let html = "";
  for (let i = 0; i < keys.length; i++) {
    let label = keys[i];
    let value = Number(data[label]) || 0;
    let width = Math.round((value / maxValue) * 100);

    html += "<div class='bar-row'>" +
      "<div class='bar-label'>" + escapeHtml(label) + "</div>" +
      "<div class='bar-track'>" +
      "<div class='bar-fill' style='width: " + width + "%'></div>" +
      "</div>" +
      "<div class='bar-value'>" + value + "</div>" +
      "</div>";
  }

  container.innerHTML = html;
}

function renderUsers() {
  let tableBody = document.getElementById("userTableBody");
  if (!tableBody || typeof users === "undefined") return;

  let searchBox = document.getElementById("userSearch");
  let roleFilterBox = document.getElementById("userRoleFilter");
  let statusFilterBox = document.getElementById("userStatusFilter");

  let keyword = searchBox ? searchBox.value.trim() : "";
  let roleFilter = roleFilterBox ? roleFilterBox.value : "All";
  let statusFilter = statusFilterBox ? statusFilterBox.value : "All";

  let rows = "";
  let shown = 0;

  for (let i = 0; i < users.length; i++) {
    let user = users[i];
    let searchable = (user.id || "") + " " + (user.name || "") + " " + (user.username || "") + " " + (user.email || "") + " " + (user.role || "");

    let matchesKeyword = containsText(searchable, keyword);
    let matchesRole = (roleFilter === "All" || !roleFilter || user.role === roleFilter);
    let matchesStatus = (statusFilter === "All" || !statusFilter || user.status === statusFilter);

    if (!matchesKeyword || !matchesRole || !matchesStatus) continue;

    let statusColor = user.status === "Active" ? "green" :
      user.status === "Pending" ? "orange" : "red";
    let approveButton = (user.status === "Pending" || user.status === "Blocked")
      ? "<button type='button' class='btn btn-small btn-success' onclick='approveUser(" + i + ")'>Approve</button>"
      : "";

    let roleClass = String(user.role || "").toLowerCase();

    rows += "<tr>" +
      "<td>" + escapeHtml(user.id || "") + "</td>" +
      "<td><strong>" + escapeHtml(user.name || "") + "</strong>" +
      (user.email ? "<br><span class='hint'>" + escapeHtml(user.email) + "</span>" : "") + "</td>" +
      "<td>" + escapeHtml(user.username || "") + "</td>" +
      "<td><span class='badge " + escapeHtml(roleClass) + "'>" + escapeHtml(user.role || "") + "</span></td>" +
      "<td><span class='badge " + statusColor + "'>" + escapeHtml(user.status || "Active") + "</span></td>" +
      "<td>" + approveButton +
      "<button type='button' class='btn btn-small' onclick='editUser(" + i + ")'>Edit</button>" +
      "<button type='button' class='btn btn-small btn-danger' onclick='deleteUser(" + i + ")'>Delete</button>" +
      "</td></tr>";
    shown++;
  }

  if (shown === 0) {
    rows = "<tr><td colspan='6' class='empty-row'>No users match your search.</td></tr>";
  }
  tableBody.innerHTML = rows;

  let count = document.getElementById("userCount");
  if (count) count.innerHTML = "Showing " + shown + " of " + users.length + " users";
}

function getSelectedUserStatus() {
  let activeRadio = document.getElementById("statusActive");
  let blockedRadio = document.getElementById("statusBlocked");
  if (blockedRadio && blockedRadio.checked) return "Blocked";
  if (activeRadio && activeRadio.checked) return "Active";
  return "Active";
}

function saveUser() {
  let nameField = document.getElementById("userName");
  let usernameField = document.getElementById("userUsername");
  let emailField = document.getElementById("userEmail");
  let passwordField = document.getElementById("userPassword");
  let roleField = document.getElementById("userRole");

  if (!nameField || !usernameField || !roleField || typeof users === "undefined") {
    return false;
  }

  let name = nameField.value.trim();
  let username = usernameField.value.trim();
  let email = emailField ? emailField.value.trim() : "";
  let password = passwordField ? passwordField.value : "";
  let role = roleField.value;
  let status = getSelectedUserStatus();

  let valid = true;
  clearErrors(["userName", "userUsername", "userEmail", "userPassword", "userRole"]);
  hideMessage("userMessage");

  if (name.length < 3) {
    showError("userName", "Name must be at least 3 characters.");
    valid = false;
  }
  if (username.length < 4) {
    showError("userUsername", "Username must be at least 4 characters.");
    valid = false;
  } else if (usernameUsedByOther(username)) {
    showError("userUsername", "This username is already in use.");
    valid = false;
  }
  if (isEmpty(email) || email.indexOf("@") === -1 || email.indexOf(".") === -1) {
    showError("userEmail", "Please enter a valid email address.");
    valid = false;
  }
  if (editUserIndex === -1 && password.length < 8) {
    showError("userPassword", "Password must be at least 8 characters.");
    valid = false;
  } else if (editUserIndex !== -1 && password.length > 0 && password.length < 8) {
    showError("userPassword", "Password must be at least 8 characters.");
    valid = false;
  }
  if (isEmpty(role)) {
    showError("userRole", "Please choose a role.");
    valid = false;
  }
  if (!valid) return false;

  if (editUserIndex === -1) {
    let prefix = role === "Patient" ? "PAT" : "U";
    let newUser = {
      id: nextId(prefix, users),
      name: name,
      username: username,
      email: email,
      password: password,
      role: role,
      status: status
    };
    users.push(newUser);
    showMessage("userMessage", "User <strong>" + escapeHtml(name) + "</strong> was added.", "success");
  } else {
    let user = users[editUserIndex];
    user.name = name;
    user.username = username;
    user.email = email;
    if (password.length > 0) {
      user.password = password;
    }
    user.role = role;
    user.status = status;
    showMessage("userMessage", "User <strong>" + escapeHtml(name) + "</strong> was updated.", "success");
  }

  resetUserForm();
  renderUsers();
  generateReport();
  return false;
}

function usernameUsedByOther(username) {
  for (let i = 0; i < users.length; i++) {
    if (i !== editUserIndex &&
      String(users[i].username || "").toLowerCase() === username.toLowerCase()) {
      return true;
    }
  }
  return false;
}

function editUser(index) {
  if (!users[index]) return;
  let user = users[index];
  editUserIndex = index;

  let nameField = document.getElementById("userName");
  let usernameField = document.getElementById("userUsername");
  let emailField = document.getElementById("userEmail");
  let passwordField = document.getElementById("userPassword");
  let roleField = document.getElementById("userRole");

  if (nameField) nameField.value = user.name || "";
  if (usernameField) usernameField.value = user.username || "";
  if (emailField) emailField.value = user.email || "";
  if (passwordField) passwordField.value = user.password || "";

  if (roleField) {
    if (user.role === "Patient") {
      let hasPatientOption = false;
      for (let i = 0; i < roleField.options.length; i++) {
        if (roleField.options[i].value === "Patient") {
          hasPatientOption = true;
        }
      }
      if (!hasPatientOption) {
        let opt = document.createElement("option");
        opt.value = "Patient";
        opt.text = "Patient";
        roleField.appendChild(opt);
      }
    }
    roleField.value = user.role || "";
  }

  let activeRadio = document.getElementById("statusActive");
  let blockedRadio = document.getElementById("statusBlocked");
  if (user.status === "Blocked") {
    if (blockedRadio) blockedRadio.checked = true;
  } else {
    if (activeRadio) activeRadio.checked = true;
  }

  let title = document.getElementById("userFormTitle");
  let saveButton = document.getElementById("userSaveButton");
  if (title) title.innerHTML = "Edit User " + escapeHtml(user.id || "");
  if (saveButton) saveButton.value = "Update User";
  hideMessage("userMessage");
}

function deleteUser(index) {
  if (!users[index]) return;
  let user = users[index];

  if (user.id === "U-001" || (user.role === "Admin" && user.username === "admin")) {
    showMessage("userMessage", "You cannot delete the main admin account.", "error");
    return;
  }

  let removedName = user.name || user.username;
  users.splice(index, 1);

  resetUserForm();
  renderUsers();
  generateReport();
  showMessage("userMessage", "User <strong>" + escapeHtml(removedName) + "</strong> was deleted.", "info");
}

function approveUser(index) {
  if (!users[index]) return;
  users[index].status = "Active";
  renderUsers();
  generateReport();
  showMessage("userMessage", "User <strong>" + escapeHtml(users[index].name) + "</strong> is now Active.", "success");
}

function resetUserForm() {
  editUserIndex = -1;
  let form = document.getElementById("userForm");
  if (form) form.reset();

  clearErrors(["userName", "userUsername", "userEmail", "userPassword", "userRole"]);
  let title = document.getElementById("userFormTitle");
  let saveButton = document.getElementById("userSaveButton");
  if (title) title.innerHTML = "Add New Staff Account";
  if (saveButton) saveButton.value = "Add Staff Account";
}

function getAmbulanceBadgeColor(status) {
  if (status === "Approved" || status === "Completed") return "green";
  if (status === "Dispatched") return "blue";
  if (status === "Pending") return "orange";
  return "red";
}

function renderAmbulances() {
  let tableBody = document.getElementById("ambulanceTableBody");
  if (!tableBody || typeof ambulances === "undefined") return;

  let searchBox = document.getElementById("ambulanceSearch");
  let statusFilterBox = document.getElementById("ambulanceStatusFilter");
  let keyword = searchBox ? searchBox.value.trim() : "";
  let statusFilter = statusFilterBox ? statusFilterBox.value : "All";

  let rows = "";
  let shown = 0;

  for (let i = 0; i < ambulances.length; i++) {
    let a = ambulances[i];
    let status = a.status || "Pending";
    let searchable = (a.id || "") + " " + (a.patient || "") + " " + (a.phone || "") + " " + (a.location || "") + " " + (a.destination || "") + " " + (a.type || "") + " " + (a.date || "");

    let matchesKeyword = containsText(searchable, keyword);
    let matchesStatus = (statusFilter === "All" || !statusFilter || status === statusFilter);

    if (!matchesKeyword || !matchesStatus) continue;

    let statusColor = getAmbulanceBadgeColor(status);
    let actionButtons = "";
    if (status === "Pending") {
      actionButtons = "<button type='button' class='btn btn-small btn-success' onclick='approveAmbulance(" + i + ")'>Approve</button>" +
        "<button type='button' class='btn btn-small btn-danger' onclick='cancelAmbulance(" + i + ")'>Cancel</button>";
    } else if (status === "Approved") {
      actionButtons = "<button type='button' class='btn btn-small' onclick='approveAmbulance(" + i + ")'>Dispatch</button>" +
        "<button type='button' class='btn btn-small btn-danger' onclick='cancelAmbulance(" + i + ")'>Cancel</button>";
    } else if (status === "Dispatched") {
      actionButtons = "<button type='button' class='btn btn-small btn-success' onclick='approveAmbulance(" + i + ")'>Complete</button>";
    } else {
      actionButtons = "<span class='hint'>No actions</span>";
    }

    let dateTimeText = (a.date || "") + (a.time ? " " + a.time : "");

    rows += "<tr>" +
      "<td>" + escapeHtml(a.id || "") + "</td>" +
      "<td>" + escapeHtml(a.patient || "") + "</td>" +
      "<td>" + escapeHtml(a.phone || "") + "</td>" +
      "<td>" + escapeHtml(a.location || "") + "</td>" +
      "<td>" + escapeHtml(a.type || "") + "</td>" +
      "<td>" + escapeHtml(dateTimeText) + "</td>" +
      "<td><span class='badge " + statusColor + "'>" + escapeHtml(status) + "</span></td>" +
      "<td>" + actionButtons + "</td>" +
      "</tr>";
    shown++;
  }

  if (shown === 0) {
    rows = "<tr><td colspan='8' class='empty-row'>No ambulance requests found.</td></tr>";
  }
  tableBody.innerHTML = rows;

  let count = document.getElementById("ambulanceCount");
  if (count) count.innerHTML = "Showing " + shown + " of " + ambulances.length + " ambulance requests";
}

function approveAmbulance(index) {
  if (!ambulances[index]) return;
  let current = ambulances[index].status || "Pending";
  if (current === "Pending") {
    ambulances[index].status = "Approved";
    if (!ambulances[index].assignedAmbulance) {
      ambulances[index].assignedAmbulance = "CNH-AMB-0" + ((index % 4) + 1);
    }
  } else if (current === "Approved") {
    ambulances[index].status = "Dispatched";
  } else if (current === "Dispatched") {
    ambulances[index].status = "Completed";
  }
  showMessage("ambulanceMessage", "Ambulance request <strong>" + escapeHtml(ambulances[index].id) + "</strong> updated to <strong>" + escapeHtml(ambulances[index].status) + "</strong>.", "success");
  renderAmbulances();
  generateReport();
}

function cancelAmbulance(index) {
  if (!ambulances[index]) return;
  ambulances[index].status = "Cancelled";
  showMessage("ambulanceMessage", "Ambulance request <strong>" + escapeHtml(ambulances[index].id) + "</strong> was cancelled.", "info");
  renderAmbulances();
  generateReport();
}

function saveAmbulance() {
  let patientField = document.getElementById("ambulancePatient");
  let phoneField = document.getElementById("ambulancePhone");
  let locationField = document.getElementById("ambulanceLocation");
  let destinationField = document.getElementById("ambulanceDestination");
  let typeField = document.getElementById("ambulanceType");
  let dateField = document.getElementById("ambulanceDate");
  let timeField = document.getElementById("ambulanceTime");

  let patient = patientField ? patientField.value.trim() : "";
  let phone = phoneField ? phoneField.value.trim() : "";
  let location = locationField ? locationField.value.trim() : "";
  let destination = destinationField ? destinationField.value.trim() : "";
  let type = typeField ? typeField.value : "";
  let date = dateField ? dateField.value : "";
  let time = timeField ? timeField.value : "";

  if (isEmpty(patient) || isEmpty(phone) || isEmpty(location) || isEmpty(destination) || isEmpty(type) || isEmpty(date) || isEmpty(time)) {
    showMessage("ambulanceMessage", "Please fill in all ambulance booking details.", "error");
    return false;
  }

  let newRequest = {
    id: nextId("AMB", ambulances),
    patient: patient,
    phone: phone,
    location: location,
    destination: destination,
    type: type,
    assignedAmbulance: "CNH-AMB-01",
    date: date,
    time: time,
    status: "Pending"
  };

  ambulances.push(newRequest);
  resetAmbulanceForm();
  renderAmbulances();
  generateReport();
  showMessage("ambulanceMessage", "Ambulance request <strong>" + escapeHtml(newRequest.id) + "</strong> booked for <strong>" + escapeHtml(patient) + "</strong>.", "success");
  return false;
}

function resetAmbulanceForm() {
  let form = document.getElementById("ambulanceForm");
  if (form) form.reset();
}

function updateReviewSummary() {
  let totalEl = document.getElementById("reviewTotal");
  let avgEl = document.getElementById("reviewAverage");
  let pendingEl = document.getElementById("reviewPending");

  let total = reviews.length;
  let sum = 0;
  let pending = 0;

  for (let i = 0; i < reviews.length; i++) {
    let ratingNum = Number(reviews[i].rating) || 0;
    sum += ratingNum;
    let status = reviews[i].status || "Pending";
    if (status === "Pending" || ratingNum <= 3) {
      pending++;
    }
  }

  let avg = total > 0 ? (sum / total).toFixed(1) : "0.0";
  if (totalEl) totalEl.textContent = total;
  if (avgEl) avgEl.textContent = avg;
  if (pendingEl) pendingEl.textContent = pending;
}

function renderReviews() {
  let tableBody = document.getElementById("reviewTableBody");
  if (!tableBody || typeof reviews === "undefined") return;

  updateReviewSummary();

  let searchBox = document.getElementById("reviewSearch");
  let ratingFilterBox = document.getElementById("reviewRatingFilter");
  let keyword = searchBox ? searchBox.value.trim() : "";
  let ratingFilter = ratingFilterBox ? ratingFilterBox.value : "All";

  let rows = "";
  let shown = 0;

  for (let i = 0; i < reviews.length; i++) {
    let review = reviews[i];
    let patientName = review.patient || review.name || "";
    let doctorName = review.doctor || "";
    let commentText = review.comment || review.message || "";
    let status = review.status || "Pending";
    let searchable = (review.id || "") + " " + patientName + " " + doctorName + " " + commentText;

    let matchesKeyword = containsText(searchable, keyword);
    let matchesRating = (ratingFilter === "All" || !ratingFilter || String(review.rating) === String(ratingFilter));

    if (!matchesKeyword || !matchesRating) continue;

    let statusColor = status === "Reviewed" ? "green" : "orange";
    let actionHtml = status === "Pending"
      ? "<button type='button' class='btn btn-small btn-success' onclick='markReviewReviewed(" + i + ")'>Mark Reviewed</button>"
      : "<button type='button' class='btn btn-small btn-secondary' onclick='prepareMeetingForDoctor(" + i + ")'>Discuss</button>";

    rows += "<tr>" +
      "<td>" + escapeHtml(review.id || "") + "</td>" +
      "<td>" + escapeHtml(patientName) + "</td>" +
      "<td>" + escapeHtml(doctorName) + "</td>" +
      "<td>" + escapeHtml(review.rating) + " / 5</td>" +
      "<td>" + escapeHtml(commentText) + "</td>" +
      "<td>" + escapeHtml(review.date || "") + "</td>" +
      "<td><span class='badge " + statusColor + "'>" + escapeHtml(status) + "</span></td>" +
      "<td>" + actionHtml + "</td>" +
      "</tr>";
    shown++;
  }

  if (shown === 0) {
    rows = "<tr><td colspan='8' class='empty-row'>No reviews found.</td></tr>";
  }
  tableBody.innerHTML = rows;

  let count = document.getElementById("reviewCount");
  if (count) count.innerHTML = "Showing " + shown + " of " + reviews.length + " reviews";
}

function markReviewReviewed(index) {
  if (!reviews[index]) return;
  reviews[index].status = "Reviewed";
  renderReviews();
  generateReport();
  showMessage("reviewMessage", "Review <strong>" + escapeHtml(reviews[index].id) + "</strong> marked as Reviewed.", "success");
}

function prepareMeetingForDoctor(index) {
  if (!reviews[index]) return;
  let review = reviews[index];
  let doctorSelect = document.getElementById("meetingDoctor");
  let subjectInput = document.getElementById("meetingSubject");
  let messageInput = document.getElementById("meetingMessage");

  if (doctorSelect) doctorSelect.value = review.doctor || "";
  if (subjectInput) subjectInput.value = "Feedback discussion for Review " + (review.id || "");
  if (messageInput) messageInput.value = "Discuss patient feedback from " + (review.patient || "") + ": " + (review.comment || "");
}

function populateMeetingDoctors() {
  let select = document.getElementById("meetingDoctor");
  if (!select || typeof doctors === "undefined") return;

  let html = "<option value=''>Select Doctor</option>";
  for (let i = 0; i < doctors.length; i++) {
    let doc = doctors[i];
    html += "<option value='" + escapeHtml(doc.name) + "'>" + escapeHtml(doc.name) + " - " + escapeHtml(doc.specialization) + "</option>";
  }
  select.innerHTML = html;
}

function renderMeetings() {
  let tableBody = document.getElementById("meetingTableBody");
  if (!tableBody || typeof meetings === "undefined") return;

  if (meetings.length === 0) {
    tableBody.innerHTML = "<tr><td colspan='5' class='empty-row'>No scheduled meetings.</td></tr>";
    return;
  }

  let rows = "";
  for (let i = 0; i < meetings.length; i++) {
    let m = meetings[i];
    rows += "<tr>" +
      "<td>" + escapeHtml(m.doctor || "") + "</td>" +
      "<td><strong>" + escapeHtml(m.subject || "") + "</strong>" +
      (m.message ? "<br><span class='hint'>" + escapeHtml(m.message) + "</span>" : "") + "</td>" +
      "<td>" + escapeHtml(m.date || "") + "</td>" +
      "<td>" + escapeHtml(m.time || "") + "</td>" +
      "<td><button type='button' class='btn btn-small btn-danger' onclick='deleteMeeting(" + i + ")'>Cancel</button></td>" +
      "</tr>";
  }
  tableBody.innerHTML = rows;
}

function saveMeeting() {
  let doctorField = document.getElementById("meetingDoctor");
  let subjectField = document.getElementById("meetingSubject");
  let dateField = document.getElementById("meetingDate");
  let timeField = document.getElementById("meetingTime");
  let messageField = document.getElementById("meetingMessage");

  let doctor = doctorField ? doctorField.value : "";
  let subject = subjectField ? subjectField.value.trim() : "";
  let date = dateField ? dateField.value : "";
  let time = timeField ? timeField.value : "";
  let message = messageField ? messageField.value.trim() : "";

  if (isEmpty(doctor) || isEmpty(subject) || isEmpty(date) || isEmpty(time) || isEmpty(message)) {
    showMessage("reviewMessage", "Please complete all meeting fields before scheduling.", "error");
    return false;
  }

  let newMeeting = {
    id: nextId("MTG", meetings),
    doctor: doctor,
    subject: subject,
    date: date,
    time: time,
    message: message
  };

  meetings.push(newMeeting);
  let form = document.getElementById("meetingForm");
  if (form) form.reset();

  renderMeetings();
  showMessage("reviewMessage", "Meeting scheduled with <strong>" + escapeHtml(doctor) + "</strong> on " + escapeHtml(date) + ".", "success");
  return false;
}

function deleteMeeting(index) {
  if (!meetings[index]) return;
  let docName = meetings[index].doctor;
  meetings.splice(index, 1);
  renderMeetings();
  showMessage("reviewMessage", "Meeting with <strong>" + escapeHtml(docName) + "</strong> was cancelled.", "info");
}

document.addEventListener("DOMContentLoaded", function () {
  if (!document.getElementById("nav-statsSection")) return;

  populateMeetingDoctors();
  showSection("statsSection");
  generateReport();
  renderUsers();
  renderAmbulances();
  renderReviews();
  renderMeetings();

  let statsNav = document.getElementById("nav-statsSection");
  if (statsNav) statsNav.addEventListener("click", generateReport);

  let usersNav = document.getElementById("nav-usersSection");
  if (usersNav) usersNav.addEventListener("click", renderUsers);

  let ambulanceNav = document.getElementById("nav-ambulanceSection");
  if (ambulanceNav) ambulanceNav.addEventListener("click", renderAmbulances);

  let reviewsNav = document.getElementById("nav-reviewsSection");
  if (reviewsNav) {
    reviewsNav.addEventListener("click", function () {
      renderReviews();
      renderMeetings();
    });
  }
});
