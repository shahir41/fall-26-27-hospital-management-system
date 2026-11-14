
const sections = ["appointmentsSection", "queueSection", "billingSection", "notificationsSection"];
let editReceptionAppointmentIndex = -1;
let editQueueIndex = -1;
let editBillIndex = -1;
let editNotificationIndex = -1;

function escapeReceptionHtml(text) {
  return String(text === undefined || text === null ? "" : text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function populateReceptionDoctorDropdowns() {
  if (typeof doctors === "undefined") return;

  let apptDocSelect = document.getElementById("appointmentDoctor");
  if (apptDocSelect) {
    let html = "<option value=''>Select a doctor</option>";
    for (let i = 0; i < doctors.length; i++) {
      let d = doctors[i];
      html += "<option value='" + escapeReceptionHtml(d.name) + "'>" + escapeReceptionHtml(d.name) + "</option>";
    }
    apptDocSelect.innerHTML = html;
  }

  let queueDocSelect = document.getElementById("queueDoctor");
  if (queueDocSelect) {
    let html = "<option value=''>Select a doctor</option>";
    for (let i = 0; i < doctors.length; i++) {
      let d = doctors[i];
      html += "<option value='" + escapeReceptionHtml(d.name) + "'>" + escapeReceptionHtml(d.name) + "</option>";
    }
    queueDocSelect.innerHTML = html;
  }
}

function getReceptionAppointmentBadge(status) {
  if (status === "Completed") return "green";
  if (status === "Cancelled") return "red";
  return "orange";
}

function getReceptionAppointmentStatus(status) {
  if (status === "Completed" || status === "Cancelled") return status;
  return "Waiting";
}

function renderAppointments() {
  let tbody = document.getElementById("appointmentTableBody");
  if (!tbody || typeof appointments === "undefined") return;

  let searchBox = document.getElementById("appointmentSearch");
  let statusFilterBox = document.getElementById("appointmentStatusFilter");
  let keyword = searchBox ? searchBox.value.trim() : "";
  let statusFilter = statusFilterBox ? statusFilterBox.value : "All";

  let rows = "";
  let shown = 0;

  for (let i = 0; i < appointments.length; i++) {
    let a = appointments[i];
    let status = getReceptionAppointmentStatus(a.status);
    let notifyId = a.notifyId || "-";
    let searchable = (a.id || "") + " " + (a.patient || "") + " " + (a.doctor || "") + " " + (a.date || "") + " " + (a.time || "") + " " + notifyId + " " + status;

    let matchesKeyword = containsText(searchable, keyword);
    let matchesStatus = (statusFilter === "All" || !statusFilter || status === statusFilter);

    if (!matchesKeyword || !matchesStatus) continue;

    let badgeColor = getReceptionAppointmentBadge(status);

    rows += "<tr>" +
      "<td>" + escapeReceptionHtml(a.id || "") + "</td>" +
      "<td>" + escapeReceptionHtml(a.patient || "") + "</td>" +
      "<td>" + escapeReceptionHtml(a.doctor || "") + "</td>" +
      "<td>" + escapeReceptionHtml(a.date || "") + "</td>" +
      "<td>" + escapeReceptionHtml(a.time || "") + "</td>" +
      "<td>" + escapeReceptionHtml(notifyId) + "</td>" +
      "<td><span class='badge " + badgeColor + "'>" + escapeReceptionHtml(status) + "</span></td>" +
      "<td>" +
      "<button type='button' class='btn btn-small' onclick='editAppointment(" + i + ")'>Edit</button>" +
      "<button type='button' class='btn btn-small btn-danger' onclick='deleteAppointment(" + i + ")'>Delete</button>" +
      "</td>" +
      "</tr>";
    shown++;
  }

  if (shown === 0) {
    rows = "<tr><td colspan='8' class='empty-row'>No appointment records found.</td></tr>";
  }
  tbody.innerHTML = rows;

  let count = document.getElementById("appointmentCount");
  if (count) count.innerHTML = "Showing " + shown + " of " + appointments.length + " appointments";
}

function saveAppointment() {
  let patientField = document.getElementById("appointmentPatient");
  let doctorField = document.getElementById("appointmentDoctor");
  let dateField = document.getElementById("appointmentDate");
  let timeField = document.getElementById("appointmentTime");

  let patient = patientField ? patientField.value.trim() : "";
  let doctor = doctorField ? doctorField.value : "";
  let date = dateField ? dateField.value : "";
  let time = timeField ? timeField.value : "";

  hideMessage("appointmentMessage");

  if (isEmpty(patient) || isEmpty(doctor) || isEmpty(date) || isEmpty(time)) {
    showMessage("appointmentMessage", "Please fill in all required appointment details.", "error");
    return false;
  }

  if (editReceptionAppointmentIndex === -1 || !appointments[editReceptionAppointmentIndex]) {
    showMessage("appointmentMessage", "Select an appointment from the records table to edit it.", "info");
    return false;
  }

  let appt = appointments[editReceptionAppointmentIndex];
  appt.patient = patient;
  appt.doctor = doctor;
  appt.date = date;
  appt.time = time;
  showMessage("appointmentMessage", "Appointment <strong>" + escapeReceptionHtml(appt.id) + "</strong> updated.", "success");

  resetAppointmentForm();
  renderAppointments();
  return false;
}

function editAppointment(index) {
  if (!appointments[index]) return;
  let a = appointments[index];
  editReceptionAppointmentIndex = index;

  let patientField = document.getElementById("appointmentPatient");
  let doctorField = document.getElementById("appointmentDoctor");
  let dateField = document.getElementById("appointmentDate");
  let timeField = document.getElementById("appointmentTime");

  if (patientField) patientField.value = a.patient || "";
  if (doctorField) doctorField.value = a.doctor || "";
  if (dateField) dateField.value = a.date || "";
  if (timeField) timeField.value = a.time || "";

  let title = document.getElementById("appointmentFormTitle");
  let btn = document.getElementById("appointmentSaveButton");
  if (title) title.innerHTML = "Update Appointment " + escapeReceptionHtml(a.id || "");
  if (btn) btn.value = "Update Appointment";
  hideMessage("appointmentMessage");
}

function deleteAppointment(index) {
  if (!appointments[index]) return;
  let removedId = appointments[index].id;
  appointments.splice(index, 1);
  resetAppointmentForm();
  renderAppointments();
  showMessage("appointmentMessage", "Appointment <strong>" + escapeReceptionHtml(removedId) + "</strong> deleted.", "info");
}

function resetAppointmentForm() {
  editReceptionAppointmentIndex = -1;
  let form = document.getElementById("appointmentForm");
  if (form) form.reset();
  let title = document.getElementById("appointmentFormTitle");
  let btn = document.getElementById("appointmentSaveButton");
  if (title) title.innerHTML = "Edit Appointment";
  if (btn) btn.value = "Update Appointment";
}


function getQueueBadgeColor(status) {
  if (status === "Completed") return "green";
  if (status === "In Consultation") return "blue";
  if (status === "Waiting") return "orange";
  if (status === "Cancelled") return "red";
  return "grey";
}

function renderQueue() {
  let tbody = document.getElementById("queueTableBody");
  if (!tbody || typeof queue === "undefined") return;

  let searchBox = document.getElementById("queueSearch");
  let statusFilterBox = document.getElementById("queueStatusFilter");
  let keyword = searchBox ? searchBox.value.trim() : "";
  let statusFilter = statusFilterBox ? statusFilterBox.value : "All";

  let rows = "";
  let shown = 0;

  for (let i = 0; i < queue.length; i++) {
    let q = queue[i];
    let status = q.status || "Waiting";
    let arrivalText = q.arrival || ((q.date || "") + (q.time ? " " + q.time : ""));
    let visitType = q.visitType || q.type || "Appointment";
    let searchable = (q.id || "") + " " + (q.patient || "") + " " + (q.patientId || "") + " " + (q.doctor || "") + " " + visitType + " " + arrivalText + " " + status;

    let matchesKeyword = containsText(searchable, keyword);
    let matchesStatus = (statusFilter === "All" || !statusFilter || status === statusFilter);

    if (!matchesKeyword || !matchesStatus) continue;

    let badgeColor = getQueueBadgeColor(status);
    rows += "<tr>" +
      "<td>" + escapeReceptionHtml(q.id || "") + "</td>" +
      "<td>" + escapeReceptionHtml(q.patient || "") + "</td>" +
      "<td>" + escapeReceptionHtml(q.patientId || "") + "</td>" +
      "<td>" + escapeReceptionHtml(q.doctor || "") + "</td>" +
      "<td>" + escapeReceptionHtml(visitType) + "</td>" +
      "<td>" + escapeReceptionHtml(arrivalText) + "</td>" +
      "<td><span class='badge " + badgeColor + "'>" + escapeReceptionHtml(status) + "</span></td>" +
      "<td>" +
      "<button type='button' class='btn btn-small' onclick='editQueueEntry(" + i + ")'>Edit</button>" +
      "</td>" +
      "</tr>";
    shown++;
  }

  if (shown === 0) {
    rows = "<tr><td colspan='8' class='empty-row'>Queue is empty.</td></tr>";
  }
  tbody.innerHTML = rows;

  let count = document.getElementById("queueCount");
  if (count) count.innerHTML = "Showing " + shown + " of " + queue.length + " queue entries";
}

function saveQueueEntry() {
  let statusField = document.getElementById("queueStatus");

  hideMessage("queueMessage");

  let status = statusField ? statusField.value : "Waiting";

  if (editQueueIndex === -1 || !queue[editQueueIndex]) {
    showMessage("queueMessage", "Select an existing queue entry using Edit before updating its status.", "info");
    return false;
  }

  let entry = queue[editQueueIndex];
  entry.status = status;
  showMessage("queueMessage", "Queue entry <strong>" + escapeReceptionHtml(entry.id) + "</strong> status updated.", "success");

  resetQueueForm();
  renderQueue();
  return false;
}

function editQueueEntry(index) {
  if (!queue[index]) return;
  let q = queue[index];
  editQueueIndex = index;

  let patientField = document.getElementById("queuePatient");
  let patientIdField = document.getElementById("queuePatientId");
  let phoneField = document.getElementById("queuePhone");
  let doctorField = document.getElementById("queueDoctor");
  let typeField = document.getElementById("queueType");
  let dateField = document.getElementById("queueDate");
  let timeField = document.getElementById("queueTime");
  let statusField = document.getElementById("queueStatus");

  if (patientField) patientField.value = q.patient || "";
  if (patientIdField) patientIdField.value = q.patientId || "";
  if (phoneField) phoneField.value = q.phone || "";
  if (doctorField) doctorField.value = q.doctor || "";
  if (typeField) typeField.value = q.visitType || "Appointment";
  if (dateField) dateField.value = q.date || "";
  if (timeField) timeField.value = q.time || "";
  if (statusField) statusField.value = q.status || "Waiting";

  let title = document.getElementById("queueFormTitle");
  let btn = document.getElementById("queueSaveButton");
  if (title) title.innerHTML = "Edit Queue Entry " + escapeReceptionHtml(q.id || "");
  if (btn) btn.value = "Update Queue Status";
  hideMessage("queueMessage");
}

function resetQueueForm() {
  editQueueIndex = -1;
  let form = document.getElementById("queueForm");
  if (form) form.reset();
  clearErrors(["queuePatient", "queuePatientId", "queuePhone", "queueDoctor", "queueDate", "queueTime"]);
  let title = document.getElementById("queueFormTitle");
  let btn = document.getElementById("queueSaveButton");
  if (title) title.innerHTML = "Edit Queue Status";
  if (btn) btn.value = "Update Queue Status";
}


function getBillBadgeColor(status) {
  if (status === "Paid") return "green";
  if (status === "Partial") return "orange";
  return "red";
}

function renderBills() {
  let tbody = document.getElementById("billingTableBody");
  if (!tbody || typeof bills === "undefined") return;

  let searchBox = document.getElementById("billingSearch");
  let statusFilterBox = document.getElementById("billingStatusFilter");
  let keyword = searchBox ? searchBox.value.trim() : "";
  let statusFilter = statusFilterBox ? statusFilterBox.value : "All";

  let rows = "";
  let shown = 0;

  for (let i = 0; i < bills.length; i++) {
    let b = bills[i];
    let total = Number(b.total || 0);
    let paid = Number(b.paid || 0);
    let due = Number(b.due !== undefined ? b.due : (total - paid));
    let status = b.status || (due === 0 ? "Paid" : (paid > 0 ? "Partial" : "Unpaid"));
    let billType = b.type || "Consultation-Full";
    let searchable = (b.id || "") + " " + (b.patient || "") + " " + (b.patientId || "") + " " + billType + " " + (b.description || "") + " " + status;

    let matchesKeyword = containsText(searchable, keyword);
    let matchesStatus = (statusFilter === "All" || !statusFilter || status === statusFilter);

    if (!matchesKeyword || !matchesStatus) continue;

    let badgeColor = getBillBadgeColor(status);

    rows += "<tr>" +
      "<td>" + escapeReceptionHtml(b.id || "") + "</td>" +
      "<td>" + escapeReceptionHtml(b.patient || "") + "</td>" +
      "<td>" + escapeReceptionHtml(b.patientId || "") + "</td>" +
      "<td>" + escapeReceptionHtml(billType) +
      (b.description ? "<br><span class='hint'>" + escapeReceptionHtml(b.description) + "</span>" : "") + "</td>" +
      "<td>" + total.toFixed(2) + "</td>" +
      "<td>" + paid.toFixed(2) + "</td>" +
      "<td>" + due.toFixed(2) + "</td>" +
      "<td><span class='badge " + badgeColor + "'>" + escapeReceptionHtml(status) + "</span></td>" +
      "<td>" +
      "<button type='button' class='btn btn-small btn-success' onclick='printBill(" + i + ")'>Print Bill</button>" +
      "<button type='button' class='btn btn-small' onclick='editBill(" + i + ")'>Edit</button>" +
      "<button type='button' class='btn btn-small btn-danger' onclick='deleteBill(" + i + ")'>Delete</button>" +
      "</td>" +
      "</tr>";
    shown++;
  }

  if (shown === 0) {
    rows = "<tr><td colspan='9' class='empty-row'>No billing records found.</td></tr>";
  }
  tbody.innerHTML = rows;

  let count = document.getElementById("billingCount");
  if (count) count.innerHTML = "Showing " + shown + " of " + bills.length + " billing records";
}

function saveBill() {
  let patientField = document.getElementById("billingPatient");
  let patientIdField = document.getElementById("billingPatientId");
  let typeField = document.getElementById("billingType");
  let descField = document.getElementById("billingDescription");
  let amountField = document.getElementById("billingAmount");
  let paidField = document.getElementById("billingPaid");
  let dateField = document.getElementById("billingDate");
  let statusField = document.getElementById("billingStatus");

  clearErrors(["billingPatient", "billingPatientId", "billingDescription", "billingAmount", "billingPaid", "billingDate"]);
  hideMessage("billingMessage");

  let patient = patientField ? patientField.value.trim() : "";
  let patientId = patientIdField ? patientIdField.value.trim() : "";
  let billType = typeField ? typeField.value : "Consultation-Full";
  let description = descField ? descField.value.trim() : "";
  let totalText = amountField ? amountField.value : "";
  let paidText = paidField ? paidField.value : "0";
  let date = dateField ? dateField.value : "";

  let total = Number(totalText);
  let paid = Number(paidText);

  let valid = true;
  if (isEmpty(patient)) {
    showError("billingPatient", "Please enter patient name.");
    valid = false;
  }
  if (isEmpty(patientId)) {
    showError("billingPatientId", "Please enter patient ID.");
    valid = false;
  }
  if (isEmpty(description)) {
    showError("billingDescription", "Please enter bill description.");
    valid = false;
  }
  if (isEmpty(totalText) || isNaN(total) || total < 0) {
    showError("billingAmount", "Please enter a valid non-negative total amount.");
    valid = false;
  }
  if (isEmpty(paidText) || isNaN(paid) || paid < 0) {
    showError("billingPaid", "Amount paid cannot be negative.");
    valid = false;
  } else if (!isNaN(total) && paid > total) {
    showError("billingPaid", "Amount paid cannot exceed total amount.");
    valid = false;
  }
  if (isEmpty(date)) {
    showError("billingDate", "Please select bill date.");
    valid = false;
  }
  if (!valid) return false;

  let due = Number((total - paid).toFixed(2));
  let computedStatus = "Unpaid";
  if (paid === 0) {
    computedStatus = "Unpaid";
  } else if (due === 0) {
    computedStatus = "Paid";
  } else {
    computedStatus = "Partial";
  }

  if (statusField) {
    statusField.value = computedStatus;
  }

  if (editBillIndex === -1) {
    let newBill = {
      id: nextId("BIL", bills),
      patient: patient,
      patientId: patientId,
      type: billType,
      description: description,
      total: total,
      paid: paid,
      due: due,
      date: date,
      status: computedStatus,
      paymentMethod: paid > 0 ? "Cash" : "",
      paymentDate: paid > 0 ? date : "",
      transactionId: paid > 0 ? ("TXN-" + (bills.length + 101)) : ""
    };
    bills.push(newBill);
    showMessage("billingMessage", "Bill <strong>" + escapeReceptionHtml(newBill.id) + "</strong> saved with status <strong>" + escapeReceptionHtml(computedStatus) + "</strong>.", "success");
  } else {
    let b = bills[editBillIndex];
    b.patient = patient;
    b.patientId = patientId;
    b.type = billType;
    b.description = description;
    b.total = total;
    b.paid = paid;
    b.due = due;
    b.date = date;
    b.status = computedStatus;
    showMessage("billingMessage", "Bill <strong>" + escapeReceptionHtml(b.id) + "</strong> updated.", "success");
  }

  resetBillingForm();
  renderBills();
  return false;
}

function editBill(index) {
  if (!bills[index]) return;
  let b = bills[index];
  editBillIndex = index;

  let patientField = document.getElementById("billingPatient");
  let patientIdField = document.getElementById("billingPatientId");
  let typeField = document.getElementById("billingType");
  let descField = document.getElementById("billingDescription");
  let amountField = document.getElementById("billingAmount");
  let paidField = document.getElementById("billingPaid");
  let dateField = document.getElementById("billingDate");
  let statusField = document.getElementById("billingStatus");

  if (patientField) patientField.value = b.patient || "";
  if (patientIdField) patientIdField.value = b.patientId || "";
  if (typeField) typeField.value = b.type || "Consultation-Full";
  if (descField) descField.value = b.description || "";
  if (amountField) amountField.value = b.total !== undefined ? b.total : 0;
  if (paidField) paidField.value = b.paid !== undefined ? b.paid : 0;
  if (dateField) dateField.value = b.date || "";
  if (statusField) statusField.value = b.status || "Unpaid";

  let title = document.getElementById("billingFormTitle");
  let btn = document.getElementById("billingSaveButton");
  if (title) title.innerHTML = "Edit Patient Bill " + escapeReceptionHtml(b.id || "");
  if (btn) btn.value = "Update Bill";
  hideMessage("billingMessage");
}

function deleteBill(index) {
  if (!bills[index]) return;
  let removedId = bills[index].id;
  bills.splice(index, 1);
  resetBillingForm();
  renderBills();
  showMessage("billingMessage", "Bill <strong>" + escapeReceptionHtml(removedId) + "</strong> deleted.", "info");
}

function printBill(index) {
  if (!bills[index]) return;
  let b = bills[index];
  let total = Number(b.total || 0);
  let paid = Number(b.paid || 0);
  let due = Number(b.due !== undefined ? b.due : (total - paid));

  let printHtml = "<!DOCTYPE html><html><head><meta charset='UTF-8'>" +
    "<title>CareNest Hospital Invoice - " + escapeReceptionHtml(b.id) + "</title>" +
    "<style>" +
    "body { font-family: Arial, sans-serif; padding: 28px; color: #222; }" +
    "h1 { color: #1B5E20; margin-bottom: 4px; }" +
    ".meta { margin-bottom: 18px; color: #444; }" +
    "table { width: 100%; border-collapse: collapse; margin-top: 16px; }" +
    "th, td { border: 1px solid #C5D6CA; padding: 10px; text-align: left; }" +
    "th { background-color: #1B5E20; color: white; }" +
    "</style></head><body>" +
    "<h1>CareNest Hospital - Patient Bill Invoice</h1>" +
    "<div class='meta'>" +
    "<p><strong>Bill ID:</strong> " + escapeReceptionHtml(b.id) + " &nbsp;|&nbsp; <strong>Bill Date:</strong> " + escapeReceptionHtml(b.date) + "</p>" +
    "<p><strong>Patient Name:</strong> " + escapeReceptionHtml(b.patient) + " &nbsp;|&nbsp; <strong>Patient ID:</strong> " + escapeReceptionHtml(b.patientId) + "</p>" +
    "<p><strong>Payment Status:</strong> " + escapeReceptionHtml(b.status) + "</p>" +
    "</div>" +
    "<table><thead><tr><th>Bill Type</th><th>Service Description</th><th>Total (Tk)</th><th>Paid (Tk)</th><th>Due (Tk)</th></tr></thead>" +
    "<tbody><tr>" +
    "<td>" + escapeReceptionHtml(b.type) + "</td>" +
    "<td>" + escapeReceptionHtml(b.description) + "</td>" +
    "<td>" + total.toFixed(2) + "</td>" +
    "<td>" + paid.toFixed(2) + "</td>" +
    "<td>" + due.toFixed(2) + "</td>" +
    "</tr></tbody></table>" +
    "</body></html>";

  let printWin = window.open("", "_blank", "width=800,height=600");
  if (printWin) {
    printWin.document.open();
    printWin.document.write(printHtml);
    printWin.document.close();
    printWin.focus();
    printWin.print();
  }
  showMessage("billingMessage", "Opened print dialog for Bill <strong>" + escapeReceptionHtml(b.id) + "</strong>.", "info");
}

function resetBillingForm() {
  editBillIndex = -1;
  let form = document.getElementById("billingForm");
  if (form) form.reset();
  clearErrors(["billingPatient", "billingPatientId", "billingDescription", "billingAmount", "billingPaid", "billingDate"]);
  let title = document.getElementById("billingFormTitle");
  let btn = document.getElementById("billingSaveButton");
  if (title) title.innerHTML = "Create Patient Bill";
  if (btn) btn.value = "Save Bill";
}

function getNotificationBadgeColor(status) {
  if (status === "Sent") return "green";
  if (status === "Ready") return "blue";
  return "orange";
}

function renderNotifications() {
  let tbody = document.getElementById("notificationTableBody");
  if (!tbody || typeof notifications === "undefined") return;

  let searchBox = document.getElementById("notificationSearch");
  let statusFilterBox = document.getElementById("notificationStatusFilter");
  let keyword = searchBox ? searchBox.value.trim() : "";
  let statusFilter = statusFilterBox ? statusFilterBox.value : "All";

  let rows = "";
  let shown = 0;

  for (let i = 0; i < notifications.length; i++) {
    let n = notifications[i];
    let status = n.status || "Draft";
    let searchable = (n.id || "") + " " + (n.patient || "") + " " + (n.patientId || "") + " " + (n.type || "") + " " + (n.channel || "") + " " + (n.subject || "") + " " + (n.message || "") + " " + status;

    let matchesKeyword = containsText(searchable, keyword);
    let matchesStatus = (statusFilter === "All" || !statusFilter || status === statusFilter);

    if (!matchesKeyword || !matchesStatus) continue;

    let badgeColor = getNotificationBadgeColor(status);
    let sendBtn = status !== "Sent"
      ? "<button type='button' class='btn btn-small btn-success' onclick='sendNotification(" + i + ")'>Send</button>"
      : "";

    rows += "<tr>" +
      "<td>" + escapeReceptionHtml(n.id || "") + "</td>" +
      "<td>" + escapeReceptionHtml(n.patient || "") +
      (n.patientId ? "<br><span class='hint'>" + escapeReceptionHtml(n.patientId) + "</span>" : "") + "</td>" +
      "<td>" + escapeReceptionHtml(n.type || "") + "</td>" +
      "<td>" + escapeReceptionHtml(n.channel || "") + "</td>" +
      "<td><strong>" + escapeReceptionHtml(n.subject || "") + "</strong>" +
      (n.message ? "<br><span class='hint'>" + escapeReceptionHtml(n.message) + "</span>" : "") + "</td>" +
      "<td>" + escapeReceptionHtml(n.date || "") + "</td>" +
      "<td><span class='badge " + badgeColor + "'>" + escapeReceptionHtml(status) + "</span></td>" +
      "<td>" +
      sendBtn +
      "<button type='button' class='btn btn-small' onclick='editNotification(" + i + ")'>Edit</button>" +
      "<button type='button' class='btn btn-small btn-danger' onclick='deleteNotification(" + i + ")'>Delete</button>" +
      "</td>" +
      "</tr>";
    shown++;
  }

  if (shown === 0) {
    rows = "<tr><td colspan='8' class='empty-row'>No notifications found.</td></tr>";
  }
  tbody.innerHTML = rows;

  let count = document.getElementById("notificationCount");
  if (count) count.innerHTML = "Showing " + shown + " of " + notifications.length + " notifications";
}

function saveNotification() {
  let patientField = document.getElementById("notificationPatient");
  let patientIdField = document.getElementById("notificationPatientId");
  let typeField = document.getElementById("notificationType");
  let channelField = document.getElementById("notificationChannel");
  let subjectField = document.getElementById("notificationSubject");
  let textField = document.getElementById("notificationText");
  let statusField = document.getElementById("notificationStatus");

  clearErrors(["notificationPatient", "notificationPatientId", "notificationSubject", "notificationText"]);
  hideMessage("notificationMessage");

  let patient = patientField ? patientField.value.trim() : "";
  let patientId = patientIdField ? patientIdField.value.trim() : "";
  let type = typeField ? typeField.value : "Appointment";
  let channel = channelField ? channelField.value : "SMS";
  let subject = subjectField ? subjectField.value.trim() : "";
  let message = textField ? textField.value.trim() : "";
  let status = statusField ? statusField.value : "Draft";

  let valid = true;
  if (isEmpty(patient)) {
    showError("notificationPatient", "Please enter patient name.");
    valid = false;
  }
  if (isEmpty(patientId)) {
    showError("notificationPatientId", "Please enter patient ID.");
    valid = false;
  }
  if (isEmpty(subject)) {
    showError("notificationSubject", "Please enter notification subject.");
    valid = false;
  }
  if (isEmpty(message)) {
    showError("notificationText", "Please enter the notification message.");
    valid = false;
  }
  if (!valid) return false;

  if (editNotificationIndex === -1) {
    let newNotif = {
      id: nextId("NOT", notifications),
      patient: patient,
      patientId: patientId,
      type: type,
      channel: channel,
      subject: subject,
      message: message,
      date: "2026-11-05",
      status: status
    };
    notifications.push(newNotif);
    showMessage("notificationMessage", "Notification <strong>" + escapeReceptionHtml(newNotif.id) + "</strong> saved.", "success");
  } else {
    let n = notifications[editNotificationIndex];
    n.patient = patient;
    n.patientId = patientId;
    n.type = type;
    n.channel = channel;
    n.subject = subject;
    n.message = message;
    n.status = status;
    showMessage("notificationMessage", "Notification <strong>" + escapeReceptionHtml(n.id) + "</strong> updated.", "success");
  }

  resetNotificationForm();
  renderNotifications();
  return false;
}

function sendNotification(index) {
  if (!notifications[index]) return;
  notifications[index].status = "Sent";
  renderNotifications();
  showMessage("notificationMessage", "Notification <strong>" + escapeReceptionHtml(notifications[index].id) + "</strong> marked as Sent.", "success");
}

function editNotification(index) {
  if (!notifications[index]) return;
  let n = notifications[index];
  editNotificationIndex = index;

  let patientField = document.getElementById("notificationPatient");
  let patientIdField = document.getElementById("notificationPatientId");
  let typeField = document.getElementById("notificationType");
  let channelField = document.getElementById("notificationChannel");
  let subjectField = document.getElementById("notificationSubject");
  let textField = document.getElementById("notificationText");
  let statusField = document.getElementById("notificationStatus");

  if (patientField) patientField.value = n.patient || "";
  if (patientIdField) patientIdField.value = n.patientId || "";
  if (typeField) typeField.value = n.type || "Appointment";
  if (channelField) channelField.value = n.channel || "SMS";
  if (subjectField) subjectField.value = n.subject || "";
  if (textField) textField.value = n.message || "";
  if (statusField) statusField.value = n.status || "Draft";

  let title = document.getElementById("notificationFormTitle");
  let btn = document.getElementById("notificationSaveButton");
  if (title) title.innerHTML = "Edit Notification " + escapeReceptionHtml(n.id || "");
  if (btn) btn.value = "Update Notification";
  hideMessage("notificationMessage");
}

function deleteNotification(index) {
  if (!notifications[index]) return;
  let removedId = notifications[index].id;
  notifications.splice(index, 1);
  resetNotificationForm();
  renderNotifications();
  showMessage("notificationMessage", "Notification <strong>" + escapeReceptionHtml(removedId) + "</strong> deleted.", "info");
}

function resetNotificationForm() {
  editNotificationIndex = -1;
  let form = document.getElementById("notificationForm");
  if (form) form.reset();
  clearErrors(["notificationPatient", "notificationPatientId", "notificationSubject", "notificationText"]);
  let title = document.getElementById("notificationFormTitle");
  let btn = document.getElementById("notificationSaveButton");
  if (title) title.innerHTML = "Create Notification";
  if (btn) btn.value = "Save Notification";
}

if (document.getElementById("nav-appointmentsSection")) {
  populateReceptionDoctorDropdowns();
  showSection("appointmentsSection");
  renderAppointments();
  renderQueue();
  renderBills();
  renderNotifications();
}
