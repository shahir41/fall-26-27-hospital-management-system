const sections = ["dashboardSection", "appointmentsSection", "notificationsSection", "paymentsSection", "reviewsSection", "ambulanceSection", "doctorsSection"];
let editPatientAppointmentIndex = -1;
let editPatientReviewIndex = -1;

function escapePatientHtml(text) {
  return String(text === undefined || text === null ? "" : text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getCurrentPatientName() {
  let nameInput = document.getElementById("patientName");
  if (nameInput && !isEmpty(nameInput.value)) {
    return nameInput.value.trim();
  }
  return "Rahim Uddin";
}

function populatePatientDoctorDropdowns() {
  if (typeof doctors === "undefined") return;

  let apptDocSelect = document.getElementById("appointmentDoctor");
  if (apptDocSelect) {
    let html = "<option value=''>Select a doctor</option>";
    for (let i = 0; i < doctors.length; i++) {
      let d = doctors[i];
      html += "<option value='" + escapePatientHtml(d.name) + "'>" + escapePatientHtml(d.name) + " - " + escapePatientHtml(d.specialization) + "</option>";
    }
    apptDocSelect.innerHTML = html;
  }

  let revDocSelect = document.getElementById("reviewDoctor");
  if (revDocSelect) {
    let html = "<option value=''>Select a doctor</option>";
    for (let i = 0; i < doctors.length; i++) {
      let d = doctors[i];
      html += "<option value='" + escapePatientHtml(d.name) + "'>" + escapePatientHtml(d.name) + "</option>";
    }
    revDocSelect.innerHTML = html;
  }
}

function updateProfile() {
  let nameField = document.getElementById("patientName");
  let emailField = document.getElementById("patientEmail");
  let phoneField = document.getElementById("patientPhone");
  let addressField = document.getElementById("patientAddress");

  clearErrors(["patientName", "patientEmail", "patientPhone", "patientAddress"]);
  hideMessage("profileMessage");

  let name = nameField ? nameField.value.trim() : "";
  let email = emailField ? emailField.value.trim() : "";
  let phone = phoneField ? phoneField.value.trim() : "";
  let address = addressField ? addressField.value.trim() : "";

  let valid = true;
  if (isEmpty(name)) {
    showError("patientName", "Please enter your full name.");
    valid = false;
  }
  if (isEmpty(email) || email.indexOf("@") === -1) {
    showError("patientEmail", "Please enter a valid email address.");
    valid = false;
  }
  if (isEmpty(phone)) {
    showError("patientPhone", "Please enter your phone number.");
    valid = false;
  }
  if (isEmpty(address)) {
    showError("patientAddress", "Please enter your address.");
    valid = false;
  }
  if (!valid) return false;

  showMessage("profileMessage", "Profile updated successfully.", "success");
  return false;
}

function getPatientAppointmentBadge(status) {
  if (status === "Approved" || status === "Confirmed" || status === "Completed") return "green";
  if (status === "Scheduled") return "blue";
  if (status === "Pending" || status === "Rescheduled") return "orange";
  if (status === "Cancelled") return "red";
  return "grey";
}

function renderAppointments() {
  let tbody = document.getElementById("appointmentTableBody");
  if (!tbody || typeof appointments === "undefined") return;

  let currentPatient = "Rahim Uddin";
  let searchBox = document.getElementById("appointmentSearch");
  let statusFilterBox = document.getElementById("appointmentStatusFilter");
  let keyword = searchBox ? searchBox.value.trim() : "";
  let statusFilter = statusFilterBox ? statusFilterBox.value : "All";

  let rows = "";
  let shown = 0;
  let totalForPatient = 0;

  for (let i = 0; i < appointments.length; i++) {
    let a = appointments[i];
    if (a.patient !== currentPatient && a.patient !== getCurrentPatientName()) continue;
    totalForPatient++;

    let status = a.status || "Pending";
    let searchable = (a.id || "") + " " + (a.doctor || "") + " " + (a.date || "") + " " + (a.time || "") + " " + (a.reason || "") + " " + status;

    let matchesKeyword = containsText(searchable, keyword);
    let matchesStatus = (statusFilter === "All" || !statusFilter || status === statusFilter || (statusFilter === "Pending" && status === "Scheduled") || (statusFilter === "Approved" && status === "Confirmed"));

    if (!matchesKeyword || !matchesStatus) continue;

    let badgeColor = getPatientAppointmentBadge(status);

    let prescriptionHtml = "<span class='hint'>Not available</span>";
    if (status === "Completed") {
      prescriptionHtml = "<button type='button' class='btn btn-small btn-success' onclick='printPatientPrescription(" + i + ")'>Print / PDF</button>";
    }

    let actionHtml = "";
    if (status !== "Completed" && status !== "Cancelled") {
      actionHtml = "<button type='button' class='btn btn-small' onclick='editPatientAppointment(" + i + ")'>Edit</button>" +
        "<button type='button' class='btn btn-small btn-danger' onclick='cancelPatientAppointment(" + i + ")'>Cancel</button>";
    } else {
      actionHtml = "<span class='hint'>No actions</span>";
    }

    rows += "<tr>" +
      "<td>" + escapePatientHtml(a.id || "") + "</td>" +
      "<td>" + escapePatientHtml(a.doctor || "") + "</td>" +
      "<td>" + escapePatientHtml(a.date || "") + "</td>" +
      "<td>" + escapePatientHtml(a.time || "") + "</td>" +
      "<td>" + escapePatientHtml(a.reason || "") + "</td>" +
      "<td><span class='badge " + badgeColor + "'>" + escapePatientHtml(status) + "</span></td>" +
      "<td>" + prescriptionHtml + "</td>" +
      "<td>" + actionHtml + "</td>" +
      "</tr>";
    shown++;
  }

  if (shown === 0) {
    rows = "<tr><td colspan='8' class='empty-row'>No appointments found.</td></tr>";
  }
  tbody.innerHTML = rows;

  let count = document.getElementById("appointmentCount");
  if (count) count.innerHTML = "Showing " + shown + " of " + totalForPatient + " appointments";
}

function printPatientPrescription(apptIndex) {
  let appt = appointments[apptIndex];
  if (!appt) return;

  let patientName = appt.patient || getCurrentPatientName();
  let matchedPrescriptions = [];

  if (typeof prescriptions !== "undefined") {
    for (let i = 0; i < prescriptions.length; i++) {
      if (prescriptions[i].patient === patientName) {
        matchedPrescriptions.push(prescriptions[i]);
      }
    }
  }

  let tableRows = "";
  if (matchedPrescriptions.length > 0) {
    for (let i = 0; i < matchedPrescriptions.length; i++) {
      let p = matchedPrescriptions[i];
      tableRows += "<tr>" +
        "<td>" + escapePatientHtml(p.id || "") + "</td>" +
        "<td>" + escapePatientHtml(p.diagnosis || "") + "</td>" +
        "<td>" + escapePatientHtml(p.medicine || "") + "</td>" +
        "<td>" + escapePatientHtml(p.dosage || "") + "</td>" +
        "<td>" + escapePatientHtml(p.frequency || "") + "</td>" +
        "<td>" + escapePatientHtml(p.duration || "") + "</td>" +
        "<td>" + escapePatientHtml(p.instructions || "") + "</td>" +
        "</tr>";
    }
  } else {
    tableRows = "<tr><td colspan='7'>General consultation completed. Follow standard care instructions.</td></tr>";
  }

  let printHtml = "<!DOCTYPE html><html><head><meta charset='UTF-8'>" +
    "<title>Prescription - " + escapePatientHtml(patientName) + "</title>" +
    "<style>" +
    "body { font-family: Arial, sans-serif; padding: 24px; color: #222; }" +
    "h1 { color: #1B5E20; margin-bottom: 4px; }" +
    "p { margin: 4px 0 14px 0; color: #444; }" +
    "table { width: 100%; border-collapse: collapse; margin-top: 16px; }" +
    "th, td { border: 1px solid #C5D6CA; padding: 10px; text-align: left; }" +
    "th { background-color: #1B5E20; color: white; }" +
    "</style></head><body>" +
    "<h1>CareNest Hospital - Patient Prescription</h1>" +
    "<p><strong>Patient:</strong> " + escapePatientHtml(patientName) +
    " &nbsp;|&nbsp; <strong>Doctor:</strong> " + escapePatientHtml(appt.doctor || "") +
    " &nbsp;|&nbsp; <strong>Visit Date:</strong> " + escapePatientHtml(appt.date || "") + "</p>" +
    "<table><thead><tr><th>ID</th><th>Diagnosis</th><th>Medicine</th><th>Dosage</th><th>Frequency</th><th>Duration</th><th>Instructions</th></tr></thead>" +
    "<tbody>" + tableRows + "</tbody></table>" +
    "</body></html>";

  let printWin = window.open("", "_blank", "width=850,height=650");
  if (printWin) {
    printWin.document.open();
    printWin.document.write(printHtml);
    printWin.document.close();
    printWin.focus();
    printWin.print();
  }
}

function saveAppointment() {
  let doctorField = document.getElementById("appointmentDoctor");
  let dateField = document.getElementById("appointmentDate");
  let timeField = document.getElementById("appointmentTime");
  let reasonField = document.getElementById("appointmentReason");

  let doctor = doctorField ? doctorField.value : "";
  let date = dateField ? dateField.value : "";
  let time = timeField ? timeField.value : "";
  let reason = reasonField ? reasonField.value.trim() : "";

  clearErrors(["appointmentDoctor", "appointmentDate", "appointmentTime", "appointmentReason"]);
  hideMessage("appointmentMessage");

  let valid = true;
  if (isEmpty(doctor)) {
    showError("appointmentDoctor", "Please select a doctor.");
    valid = false;
  }
  if (isEmpty(date)) {
    showError("appointmentDate", "Please choose an appointment date.");
    valid = false;
  }
  if (isEmpty(time)) {
    showError("appointmentTime", "Please choose an appointment time.");
    valid = false;
  }
  if (isEmpty(reason)) {
    showError("appointmentReason", "Please describe the reason for the appointment.");
    valid = false;
  }
  if (!valid) return false;

  if (editPatientAppointmentIndex === -1) {
    let newAppt = {
      id: nextId("APT", appointments),
      patient: "Rahim Uddin",
      doctor: doctor,
      date: date,
      time: time,
      reason: reason,
      status: "Pending",
      availability: "Available",
      newDate: "-"
    };
    appointments.push(newAppt);
    showMessage("appointmentMessage", "Appointment <strong>" + escapePatientHtml(newAppt.id) + "</strong> booked successfully.", "success");
  } else {
    let a = appointments[editPatientAppointmentIndex];
    a.doctor = doctor;
    a.date = date;
    a.time = time;
    a.reason = reason;
    showMessage("appointmentMessage", "Appointment <strong>" + escapePatientHtml(a.id) + "</strong> updated successfully.", "success");
  }

  resetAppointmentForm();
  renderAppointments();
  return false;
}

function editPatientAppointment(index) {
  if (!appointments[index]) return;
  let a = appointments[index];
  editPatientAppointmentIndex = index;

  let doctorField = document.getElementById("appointmentDoctor");
  let dateField = document.getElementById("appointmentDate");
  let timeField = document.getElementById("appointmentTime");
  let reasonField = document.getElementById("appointmentReason");

  if (doctorField) doctorField.value = a.doctor || "";
  if (dateField) dateField.value = a.date || "";
  if (timeField) timeField.value = a.time || "";
  if (reasonField) reasonField.value = a.reason || "";

  let title = document.getElementById("appointmentFormTitle");
  let btn = document.getElementById("appointmentSaveButton");
  if (title) title.innerHTML = "Update Appointment " + escapePatientHtml(a.id || "");
  if (btn) btn.value = "Update Appointment";
  hideMessage("appointmentMessage");
}

function cancelPatientAppointment(index) {
  if (!appointments[index]) return;
  appointments[index].status = "Cancelled";
  resetAppointmentForm();
  renderAppointments();
  showMessage("appointmentMessage", "Appointment <strong>" + escapePatientHtml(appointments[index].id) + "</strong> has been cancelled.", "info");
}

function resetAppointmentForm() {
  editPatientAppointmentIndex = -1;
  let form = document.getElementById("appointmentForm");
  if (form) form.reset();
  clearErrors(["appointmentDoctor", "appointmentDate", "appointmentTime", "appointmentReason"]);
  let title = document.getElementById("appointmentFormTitle");
  let btn = document.getElementById("appointmentSaveButton");
  if (title) title.innerHTML = "Book an Appointment";
  if (btn) btn.value = "Book Appointment";
}

function isAllowedBillService(bill) {
  let text = ((bill.type || "") + " " + (bill.description || "")).toLowerCase();
  return text.indexOf("visit") !== -1 || text.indexOf("consultation") !== -1 || text.indexOf("report") !== -1;
}

function populatePaymentBillDropdown() {
  let select = document.getElementById("paymentBill");
  if (!select || typeof bills === "undefined") return;

  let html = "<option value=''>Select an unpaid bill</option>";
  for (let i = 0; i < bills.length; i++) {
    let b = bills[i];
    if (b.patient !== "Rahim Uddin" && b.patientId !== "PAT-001") continue;
    if (!isAllowedBillService(b)) continue;

    let total = Number(b.total || 0);
    let status = b.status === "Paid" ? "Paid" : "Unpaid";
    if (status === "Unpaid") {
      let serviceLabel = b.description || b.type || "Doctor Visit";
      html += "<option value='" + escapePatientHtml(b.id) + "'>" + escapePatientHtml(b.id) + " - " + escapePatientHtml(serviceLabel) + " (" + total + " Tk)</option>";
    }
  }
  select.innerHTML = html;
}

function syncBillAmount() {
  let billSelect = document.getElementById("paymentBill");
  let amountField = document.getElementById("paymentAmount");
  if (!billSelect || !amountField || typeof bills === "undefined") return;

  let selectedId = billSelect.value;
  if (!selectedId) {
    amountField.value = "";
    return;
  }

  for (let i = 0; i < bills.length; i++) {
    if (bills[i].id === selectedId) {
      amountField.value = Number(bills[i].total || 0);
      break;
    }
  }
}

function renderPayments() {
  let billBody = document.getElementById("billTableBody");
  let historyBody = document.getElementById("paymentHistoryBody");
  if (!billBody || !historyBody || typeof bills === "undefined") return;

  populatePaymentBillDropdown();

  let searchBox = document.getElementById("billSearch");
  let keyword = searchBox ? searchBox.value.trim() : "";

  let billRows = "";
  let shownBills = 0;
  let totalPatientBills = 0;

  let historyRows = "";
  let shownHistory = 0;

  for (let i = 0; i < bills.length; i++) {
    let b = bills[i];
    if (b.patient !== "Rahim Uddin" && b.patientId !== "PAT-001") continue;
    if (!isAllowedBillService(b)) continue;
    totalPatientBills++;

    let serviceText = b.description || b.type || "Doctor Visit";
    let total = Number(b.total || 0);
    let isPaid = (b.status === "Paid" || Number(b.paid || 0) >= total);
    let status = isPaid ? "Paid" : "Unpaid";

    let searchable = (b.id || "") + " " + serviceText + " " + (b.type || "") + " " + (b.date || "") + " " + status;
    if (containsText(searchable, keyword)) {
      let badgeColor = isPaid ? "green" : "red";
      let amountDisplay = total + " Tk";

      billRows += "<tr>" +
        "<td>" + escapePatientHtml(b.id || "") + "</td>" +
        "<td>" + escapePatientHtml(serviceText) + "</td>" +
        "<td>" + escapePatientHtml(b.date || "") + "</td>" +
        "<td>" + escapePatientHtml(amountDisplay) + "</td>" +
        "<td><span class='badge " + badgeColor + "'>" + escapePatientHtml(status) + "</span></td>" +
        "</tr>";
      shownBills++;
    }

    if (isPaid) {
      let txnId = b.transactionId || ("TXN-" + String(b.id || "").replace("BIL-", ""));
      let payDate = b.paymentDate || b.date || "";
      let method = b.paymentMethod || "Online";

      historyRows += "<tr>" +
        "<td>" + escapePatientHtml(txnId) + "</td>" +
        "<td>" + escapePatientHtml(b.id || "") + "</td>" +
        "<td>" + escapePatientHtml(payDate) + "</td>" +
        "<td>" + escapePatientHtml(method) + "</td>" +
        "<td>" + escapePatientHtml(total + " Tk") + "</td>" +
        "<td><span class='badge green'>Paid</span></td>" +
        "</tr>";
      shownHistory++;
    }
  }

  if (shownBills === 0) {
    billRows = "<tr><td colspan='5' class='empty-row'>No bills to show.</td></tr>";
  }
  billBody.innerHTML = billRows;

  let billCount = document.getElementById("billCount");
  if (billCount) billCount.innerHTML = "Showing " + shownBills + " of " + totalPatientBills + " bills";

  if (shownHistory === 0) {
    historyRows = "<tr><td colspan='6' class='empty-row'>No payment history.</td></tr>";
  }
  historyBody.innerHTML = historyRows;
}

function makePayment() {
  let billSelect = document.getElementById("paymentBill");
  let amountField = document.getElementById("paymentAmount");
  let methodSelect = document.getElementById("paymentMethod");
  let refField = document.getElementById("paymentReference");

  clearErrors(["paymentBill", "paymentAmount", "paymentMethod", "paymentReference"]);
  hideMessage("paymentMessage");

  let billId = billSelect ? billSelect.value : "";
  let amountText = amountField ? amountField.value : "";
  let amount = Number(amountText);
  let method = methodSelect ? methodSelect.value : "";
  let reference = refField ? refField.value.trim() : "";

  let valid = true;
  if (isEmpty(billId)) {
    showError("paymentBill", "Please select an unpaid bill.");
    valid = false;
  }
  if (isEmpty(amountText) || isNaN(amount) || amount <= 0) {
    showError("paymentAmount", "Please enter a valid payment amount.");
    valid = false;
  }
  if (isEmpty(method)) {
    showError("paymentMethod", "Please select a payment method.");
    valid = false;
  }
  if (isEmpty(reference)) {
    showError("paymentReference", "Please enter a transaction reference.");
    valid = false;
  }
  if (!valid) return false;

  let targetBill = null;
  for (let i = 0; i < bills.length; i++) {
    if (bills[i].id === billId) {
      targetBill = bills[i];
      break;
    }
  }

  if (!targetBill) {
    showError("paymentBill", "Selected bill could not be found.");
    return false;
  }

  let total = Number(targetBill.total || 0);

  if (amount !== total) {
    showError("paymentAmount", "Partial payments are not allowed. Please enter the full bill amount (" + total + " Tk).");
    return false;
  }

  targetBill.paid = total;
  targetBill.due = 0;
  targetBill.status = "Paid";
  targetBill.paymentMethod = method;
  targetBill.paymentDate = "2026-11-06";
  targetBill.transactionId = reference;

  let form = document.getElementById("paymentForm");
  if (form) form.reset();

  renderPayments();
  showMessage("paymentMessage", "Full payment of <strong>" + total + " Tk</strong> for bill <strong>" + escapePatientHtml(billId) + "</strong> processed successfully.", "success");
  return false;
}

function renderReviews() {
  let tbody = document.getElementById("reviewTableBody");
  if (!tbody || typeof reviews === "undefined") return;

  let searchBox = document.getElementById("reviewSearch");
  let ratingFilterBox = document.getElementById("reviewRatingFilter");
  let keyword = searchBox ? searchBox.value.trim() : "";
  let ratingFilter = ratingFilterBox ? ratingFilterBox.value : "All";

  let rows = "";
  let shown = 0;
  let totalPatientReviews = 0;

  for (let i = 0; i < reviews.length; i++) {
    let r = reviews[i];
    if (r.patient !== "Rahim Uddin" && r.patient !== getCurrentPatientName()) continue;
    totalPatientReviews++;

    let commentText = r.comment || r.message || "";
    let searchable = (r.id || "") + " " + (r.doctor || "") + " " + commentText + " " + (r.date || "");
    let matchesKeyword = containsText(searchable, keyword);
    let matchesRating = (ratingFilter === "All" || !ratingFilter || String(r.rating) === String(ratingFilter));

    if (!matchesKeyword || !matchesRating) continue;

    rows += "<tr>" +
      "<td>" + escapePatientHtml(r.id || "") + "</td>" +
      "<td>" + escapePatientHtml(r.doctor || "") + "</td>" +
      "<td>" + escapePatientHtml(r.rating) + " / 5</td>" +
      "<td>" + escapePatientHtml(commentText) + "</td>" +
      "<td>" + escapePatientHtml(r.date || "") + "</td>" +
      "<td>" +
      "<button type='button' class='btn btn-small' onclick='editPatientReview(" + i + ")'>Edit</button>" +
      "<button type='button' class='btn btn-small btn-danger' onclick='deletePatientReview(" + i + ")'>Delete</button>" +
      "</td>" +
      "</tr>";
    shown++;
  }

  if (shown === 0) {
    rows = "<tr><td colspan='6' class='empty-row'>No reviews found.</td></tr>";
  }
  tbody.innerHTML = rows;

  let count = document.getElementById("reviewCount");
  if (count) count.innerHTML = "Showing " + shown + " of " + totalPatientReviews + " reviews";
}

function saveReview() {
  let doctorField = document.getElementById("reviewDoctor");
  let ratingField = document.getElementById("reviewRating");
  let commentField = document.getElementById("reviewComment");

  clearErrors(["reviewDoctor", "reviewRating", "reviewComment"]);
  hideMessage("reviewMessage");

  let doctor = doctorField ? doctorField.value : "";
  let rating = ratingField ? ratingField.value : "";
  let comment = commentField ? commentField.value.trim() : "";

  let valid = true;
  if (isEmpty(doctor)) {
    showError("reviewDoctor", "Please select a doctor.");
    valid = false;
  }
  if (isEmpty(rating)) {
    showError("reviewRating", "Please select a rating.");
    valid = false;
  }
  if (isEmpty(comment)) {
    showError("reviewComment", "Please write your review comment.");
    valid = false;
  }
  if (!valid) return false;

  if (editPatientReviewIndex === -1) {
    let newReview = {
      id: nextId("REV", reviews),
      patient: "Rahim Uddin",
      doctor: doctor,
      rating: Number(rating),
      comment: comment,
      date: "2026-11-06",
      status: "Pending"
    };
    reviews.push(newReview);
    showMessage("reviewMessage", "Review <strong>" + escapePatientHtml(newReview.id) + "</strong> submitted.", "success");
  } else {
    let rev = reviews[editPatientReviewIndex];
    rev.doctor = doctor;
    rev.rating = Number(rating);
    rev.comment = comment;
    showMessage("reviewMessage", "Review <strong>" + escapePatientHtml(rev.id) + "</strong> updated.", "success");
  }

  resetReviewForm();
  renderReviews();
  return false;
}

function editPatientReview(index) {
  if (!reviews[index]) return;
  let r = reviews[index];
  editPatientReviewIndex = index;

  let doctorField = document.getElementById("reviewDoctor");
  let ratingField = document.getElementById("reviewRating");
  let commentField = document.getElementById("reviewComment");

  if (doctorField) doctorField.value = r.doctor || "";
  if (ratingField) ratingField.value = String(r.rating || "");
  if (commentField) commentField.value = r.comment || r.message || "";

  let title = document.getElementById("reviewFormTitle");
  let btn = document.getElementById("reviewSaveButton");
  if (title) title.innerHTML = "Edit Review " + escapePatientHtml(r.id || "");
  if (btn) btn.value = "Update Review";
  hideMessage("reviewMessage");
}

function deletePatientReview(index) {
  if (!reviews[index]) return;
  let removedId = reviews[index].id;
  reviews.splice(index, 1);
  resetReviewForm();
  renderReviews();
  showMessage("reviewMessage", "Review <strong>" + escapePatientHtml(removedId) + "</strong> deleted.", "info");
}

function resetReviewForm() {
  editPatientReviewIndex = -1;
  let form = document.getElementById("reviewForm");
  if (form) form.reset();
  clearErrors(["reviewDoctor", "reviewRating", "reviewComment"]);
  let title = document.getElementById("reviewFormTitle");
  let btn = document.getElementById("reviewSaveButton");
  if (title) title.innerHTML = "Write a Review";
  if (btn) btn.value = "Submit Review";
}

function getPatientAmbulanceBadge(status) {
  if (status === "Approved" || status === "Completed") return "green";
  if (status === "Dispatched") return "blue";
  if (status === "Pending") return "orange";
  return "red";
}

function renderAmbulanceRequests() {
  let tbody = document.getElementById("patientAmbulanceRequestTableBody");
  if (!tbody || typeof ambulances === "undefined") return;

  let searchBox = document.getElementById("ambulanceRequestSearch");
  let statusFilterBox = document.getElementById("ambulanceRequestStatusFilter");
  let keyword = searchBox ? searchBox.value.trim() : "";
  let statusFilter = statusFilterBox ? statusFilterBox.value : "All";

  let rows = "";
  let shown = 0;
  let totalForPatient = 0;

  for (let i = 0; i < ambulances.length; i++) {
    let a = ambulances[i];
    if (a.patient !== "Rahim Uddin" && a.patient !== getCurrentPatientName()) continue;
    totalForPatient++;

    let status = a.status || "Pending";
    let assigned = a.assignedAmbulance || (status === "Pending" ? "Pending Assignment" : "CNH-AMB-01");
    let searchable = (a.id || "") + " " + (a.location || "") + " " + (a.destination || "") + " " + (a.type || "") + " " + (a.date || "") + " " + status;

    let matchesKeyword = containsText(searchable, keyword);
    let matchesStatus = (statusFilter === "All" || !statusFilter || status === statusFilter);

    if (!matchesKeyword || !matchesStatus) continue;

    let badgeColor = getPatientAmbulanceBadge(status);

    rows += "<tr>" +
      "<td>" + escapePatientHtml(a.id || "") + "</td>" +
      "<td>" + escapePatientHtml(a.location || "") + "</td>" +
      "<td>" + escapePatientHtml(a.destination || "") + "</td>" +
      "<td>" + escapePatientHtml(a.type || "") + "</td>" +
      "<td>" + escapePatientHtml(a.date || "") + "</td>" +
      "<td>" + escapePatientHtml(a.time || "") + "</td>" +
      "<td>" + escapePatientHtml(assigned) + "</td>" +
      "<td><span class='badge " + badgeColor + "'>" + escapePatientHtml(status) + "</span></td>" +
      "</tr>";
    shown++;
  }

  if (shown === 0) {
    rows = "<tr><td colspan='8' class='empty-row'>No ambulance requests found.</td></tr>";
  }
  tbody.innerHTML = rows;

  let count = document.getElementById("ambulanceRequestCount");
  if (count) count.innerHTML = "Showing " + shown + " of " + totalForPatient + " ambulance requests";
}

function saveAmbulanceRequest() {
  let patientField = document.getElementById("ambulanceRequestPatient");
  let phoneField = document.getElementById("ambulanceRequestPhone");
  let locationField = document.getElementById("ambulanceRequestLocation");
  let destinationField = document.getElementById("ambulanceRequestDestination");
  let typeField = document.getElementById("ambulanceRequestType");
  let dateField = document.getElementById("ambulanceRequestDate");
  let timeField = document.getElementById("ambulanceRequestTime");

  let fieldIds = [
    "ambulanceRequestPatient",
    "ambulanceRequestPhone",
    "ambulanceRequestLocation",
    "ambulanceRequestDestination",
    "ambulanceRequestType",
    "ambulanceRequestDate",
    "ambulanceRequestTime"
  ];
  clearErrors(fieldIds);
  hideMessage("ambulanceRequestMessage");

  let patient = patientField ? patientField.value.trim() : "Rahim Uddin";
  let phone = phoneField ? phoneField.value.trim() : "";
  let location = locationField ? locationField.value.trim() : "";
  let destination = destinationField ? destinationField.value.trim() : "";
  let type = typeField ? typeField.value : "";
  let date = dateField ? dateField.value : "";
  let time = timeField ? timeField.value : "";

  let valid = true;
  if (isEmpty(patient)) {
    showError("ambulanceRequestPatient", "Please enter patient name.");
    valid = false;
  }
  if (isEmpty(phone)) {
    showError("ambulanceRequestPhone", "Please enter contact number.");
    valid = false;
  }
  if (isEmpty(location)) {
    showError("ambulanceRequestLocation", "Please enter pickup location.");
    valid = false;
  }
  if (isEmpty(destination)) {
    showError("ambulanceRequestDestination", "Please enter destination.");
    valid = false;
  }
  if (isEmpty(type)) {
    showError("ambulanceRequestType", "Please select ambulance type.");
    valid = false;
  }
  if (isEmpty(date)) {
    showError("ambulanceRequestDate", "Please select required date.");
    valid = false;
  }
  if (isEmpty(time)) {
    showError("ambulanceRequestTime", "Please select required time.");
    valid = false;
  }
  if (!valid) return false;

  let newAmb = {
    id: nextId("AMB", ambulances),
    patient: "Rahim Uddin",
    phone: phone,
    location: location,
    destination: destination,
    type: type,
    assignedAmbulance: "Pending Assignment",
    date: date,
    time: time,
    status: "Pending"
  };

  ambulances.push(newAmb);
  resetAmbulanceRequestForm();
  renderAmbulanceRequests();
  showMessage("ambulanceRequestMessage", "Ambulance request <strong>" + escapePatientHtml(newAmb.id) + "</strong> submitted.", "success");
  return false;
}

function resetAmbulanceRequestForm() {
  let form = document.getElementById("ambulanceRequestForm");
  if (form) form.reset();
  let patientField = document.getElementById("ambulanceRequestPatient");
  let phoneField = document.getElementById("ambulanceRequestPhone");
  let destField = document.getElementById("ambulanceRequestDestination");
  if (patientField) patientField.value = "Rahim Uddin";
  if (phoneField) phoneField.value = "01700000000";
  if (destField) destField.value = "CareNest Hospital";
  clearErrors([
    "ambulanceRequestPatient",
    "ambulanceRequestPhone",
    "ambulanceRequestLocation",
    "ambulanceRequestDestination",
    "ambulanceRequestType",
    "ambulanceRequestDate",
    "ambulanceRequestTime"
  ]);
}

function resetAmbulanceForm() {
  resetAmbulanceRequestForm();
}

function renderDoctors() {
  let tbody = document.getElementById("doctorTableBody");
  if (!tbody || typeof doctors === "undefined") return;

  let searchBox = document.getElementById("doctorSearch");
  let specialtyFilterBox = document.getElementById("doctorSpecialtyFilter");
  let keyword = searchBox ? searchBox.value.trim() : "";
  let specialtyFilter = specialtyFilterBox ? specialtyFilterBox.value : "All";

  let rows = "";
  let shown = 0;

  for (let i = 0; i < doctors.length; i++) {
    let d = doctors[i];
    let searchable = (d.id || "") + " " + (d.name || "") + " " + (d.specialization || "") + " " + (d.department || "");
    let matchesKeyword = containsText(searchable, keyword);
    let matchesSpecialty = (specialtyFilter === "All" || !specialtyFilter || d.specialization === specialtyFilter || d.department === specialtyFilter);

    if (!matchesKeyword || !matchesSpecialty) continue;

    rows += "<tr>" +
      "<td>" + escapePatientHtml(d.id || "") + "</td>" +
      "<td>" + escapePatientHtml(d.name || "") + "</td>" +
      "<td>" + escapePatientHtml(d.specialization || "") + "</td>" +
      "<td>" + escapePatientHtml(d.availableDays || "") + "</td>" +
      "<td>" + escapePatientHtml(d.fee + " Tk") + "</td>" +
      "</tr>";
    shown++;
  }

  if (shown === 0) {
    rows = "<tr><td colspan='5' class='empty-row'>No doctors match your search.</td></tr>";
  }
  tbody.innerHTML = rows;

  let count = document.getElementById("doctorCount");
  if (count) count.innerHTML = "Showing " + shown + " of " + doctors.length + " doctors";
}
function renderPatientNotifications() {
  let tbody = document.getElementById("patientNotificationTableBody");
  if (!tbody || typeof notifications === "undefined") return;

  let currentPatient = getCurrentPatientName();
  let rows = "";
  let shown = 0;

  for (let i = 0; i < notifications.length; i++) {
    let n = notifications[i];

    // Only show notifications for the logged-in patient and only if they are "Sent"
    if (n.patient !== currentPatient || n.status !== "Sent") continue;

    rows += "<tr>" +
      "<td>" + escapePatientHtml(n.id || "") + "</td>" +
      "<td><span class='badge orange'>" + escapePatientHtml(n.type || "Notice") + "</span></td>" +
      "<td><strong>" + escapePatientHtml(n.subject || "") + "</strong></td>" +
      "<td>" + escapePatientHtml(n.message || "") + "</td>" +
      "<td>" + escapePatientHtml(n.date || "") + "</td>" +
      "</tr>";
    shown++;
  }

  if (shown === 0) {
    rows = "<tr><td colspan='5' class='empty-row'>No notifications for you yet.</td></tr>";
  }
  tbody.innerHTML = rows;
}
if (document.getElementById("nav-dashboardSection")) {
  populatePatientDoctorDropdowns();
  showSection("dashboardSection");
  renderAppointments();
  renderPayments();
  renderReviews();
  renderAmbulanceRequests();
  renderDoctors();
  renderPatientNotifications();
}
