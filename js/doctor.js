const sections = ["prescriptionsSection", "scheduleSection", "historySection", "messagesSection"];
let editPrescriptionIndex = -1;
let editScheduleIndex = -1;

function escapeDoctorHtml(text) {
  return String(text === undefined || text === null ? "" : text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function computeNextCalendarDay(dateString) {
  if (!dateString) return "";
  let parts = String(dateString).split("-");
  if (parts.length !== 3) return "";
  let year = Number(parts[0]);
  let month = Number(parts[1]) - 1;
  let day = Number(parts[2]);
  let d = new Date(year, month, day);
  if (isNaN(d.getTime())) return "";
  d.setDate(d.getDate() + 1);
  let y = String(d.getFullYear());
  let m = String(d.getMonth() + 1);
  let dd = String(d.getDate());
  if (m.length < 2) m = "0" + m;
  if (dd.length < 2) dd = "0" + dd;
  return y + "-" + m + "-" + dd;
}

function getPatientIdByName(patientName) {
  if (typeof users !== "undefined") {
    for (let i = 0; i < users.length; i++) {
      if (users[i].name === patientName && String(users[i].id).indexOf("PAT-") === 0) {
        return users[i].id;
      }
    }
  }
  if (patientName === "Rahim Uddin") return "PAT-001";
  if (patientName === "Nusrat Jahan") return "PAT-002";
  if (patientName === "Sakib Hasan") return "PAT-003";
  return "PAT-001";
}

function renderPrescriptions() {
  let tableBody = document.getElementById("prescriptionTableBody");
  if (!tableBody || typeof prescriptions === "undefined") return;

  let searchBox = document.getElementById("prescriptionSearch");
  let patientFilterBox = document.getElementById("prescriptionPatientFilter");
  let keyword = searchBox ? searchBox.value.trim() : "";
  let patientFilter = patientFilterBox ? patientFilterBox.value : "All";

  let rows = "";
  let shown = 0;

  for (let i = 0; i < prescriptions.length; i++) {
    let p = prescriptions[i];
    let searchable = (p.id || "") + " " + (p.patient || "") + " " + (p.diagnosis || "") + " " + (p.medicine || "") + " " + (p.dosage || "") + " " + (p.frequency || "") + " " + (p.duration || "");

    let matchesKeyword = containsText(searchable, keyword);
    let matchesPatient = (patientFilter === "All" || !patientFilter || p.patient === patientFilter);

    if (!matchesKeyword || !matchesPatient) continue;

    rows += "<tr>" +
      "<td>" + escapeDoctorHtml(p.id || "") + "</td>" +
      "<td>" + escapeDoctorHtml(p.patient || "") + "</td>" +
      "<td>" + escapeDoctorHtml(p.diagnosis || "") + "</td>" +
      "<td>" + escapeDoctorHtml(p.medicine || "") + "</td>" +
      "<td>" + escapeDoctorHtml(p.dosage || "") + "</td>" +
      "<td>" + escapeDoctorHtml(p.frequency || "") + "</td>" +
      "<td>" + escapeDoctorHtml(p.duration || "") + "</td>" +
      "<td>" +
      "<button type='button' class='btn btn-small' onclick='editPrescription(" + i + ")'>Edit</button>" +
      "<button type='button' class='btn btn-small btn-danger' onclick='deletePrescription(" + i + ")'>Delete</button>" +
      "</td>" +
      "</tr>";
    shown++;
  }

  if (shown === 0) {
    rows = "<tr><td colspan='8' class='empty-row'>No prescriptions found.</td></tr>";
  }
  tableBody.innerHTML = rows;

  let count = document.getElementById("prescriptionCount");
  if (count) count.innerHTML = "Showing " + shown + " of " + prescriptions.length + " prescriptions";
}

function savePrescription() {
  let patientField = document.getElementById("prescriptionPatient");
  let diagnosisField = document.getElementById("prescriptionDiagnosis");
  let medicineField = document.getElementById("prescriptionMedicine");
  let dosageField = document.getElementById("prescriptionDosage");
  let frequencyField = document.getElementById("prescriptionFrequency");
  let durationField = document.getElementById("prescriptionDuration");
  let instructionsField = document.getElementById("prescriptionInstructions");

  let patient = patientField ? patientField.value : "";
  let diagnosis = diagnosisField ? diagnosisField.value.trim() : "";
  let medicine = medicineField ? medicineField.value.trim() : "";
  let dosage = dosageField ? dosageField.value.trim() : "";
  let frequency = frequencyField ? frequencyField.value.trim() : "";
  let duration = durationField ? durationField.value.trim() : "";
  let instructions = instructionsField ? instructionsField.value.trim() : "";

  let fieldIds = [
    "prescriptionPatient",
    "prescriptionDiagnosis",
    "prescriptionMedicine",
    "prescriptionDosage",
    "prescriptionFrequency",
    "prescriptionDuration",
    "prescriptionInstructions"
  ];
  clearErrors(fieldIds);
  hideMessage("prescriptionMessage");

  let valid = true;
  if (isEmpty(patient)) {
    showError("prescriptionPatient", "Please select a patient.");
    valid = false;
  }
  if (isEmpty(diagnosis)) {
    showError("prescriptionDiagnosis", "Please enter a diagnosis.");
    valid = false;
  }
  if (isEmpty(medicine)) {
    showError("prescriptionMedicine", "Please enter medicine name.");
    valid = false;
  }
  if (isEmpty(dosage)) {
    showError("prescriptionDosage", "Please enter dosage.");
    valid = false;
  }
  if (isEmpty(frequency)) {
    showError("prescriptionFrequency", "Please enter frequency.");
    valid = false;
  }
  if (isEmpty(duration)) {
    showError("prescriptionDuration", "Please enter duration.");
    valid = false;
  }
  if (!valid) return false;

  if (editPrescriptionIndex === -1) {
    let newRecord = {
      id: nextId("PRX", prescriptions),
      patient: patient,
      diagnosis: diagnosis,
      medicine: medicine,
      dosage: dosage,
      frequency: frequency,
      duration: duration,
      instructions: instructions
    };
    prescriptions.push(newRecord);
    showMessage("prescriptionMessage", "Prescription <strong>" + escapeDoctorHtml(newRecord.id) + "</strong> saved for <strong>" + escapeDoctorHtml(patient) + "</strong>.", "success");
  } else {
    let record = prescriptions[editPrescriptionIndex];
    record.patient = patient;
    record.diagnosis = diagnosis;
    record.medicine = medicine;
    record.dosage = dosage;
    record.frequency = frequency;
    record.duration = duration;
    record.instructions = instructions;
    showMessage("prescriptionMessage", "Prescription <strong>" + escapeDoctorHtml(record.id) + "</strong> updated.", "success");
  }

  if (typeof saveSharedData === "function") saveSharedData();
  resetPrescriptionForm();
  renderPrescriptions();
  return false;
}

function editPrescription(index) {
  if (!prescriptions[index]) return;
  let p = prescriptions[index];
  editPrescriptionIndex = index;

  let patientField = document.getElementById("prescriptionPatient");
  let diagnosisField = document.getElementById("prescriptionDiagnosis");
  let medicineField = document.getElementById("prescriptionMedicine");
  let dosageField = document.getElementById("prescriptionDosage");
  let frequencyField = document.getElementById("prescriptionFrequency");
  let durationField = document.getElementById("prescriptionDuration");
  let instructionsField = document.getElementById("prescriptionInstructions");

  if (patientField) patientField.value = p.patient || "";
  if (diagnosisField) diagnosisField.value = p.diagnosis || "";
  if (medicineField) medicineField.value = p.medicine || "";
  if (dosageField) dosageField.value = p.dosage || "";
  if (frequencyField) frequencyField.value = p.frequency || "";
  if (durationField) durationField.value = p.duration || "";
  if (instructionsField) instructionsField.value = p.instructions || "";

  let title = document.getElementById("prescriptionFormTitle");
  let btn = document.getElementById("prescriptionSaveButton");
  if (title) title.innerHTML = "Edit Prescription " + escapeDoctorHtml(p.id || "");
  if (btn) btn.value = "Update Prescription";
  hideMessage("prescriptionMessage");
}

function deletePrescription(index) {
  if (!prescriptions[index]) return;
  let removedId = prescriptions[index].id;
  prescriptions.splice(index, 1);
  if (typeof saveSharedData === "function") saveSharedData();
  resetPrescriptionForm();
  renderPrescriptions();
  showMessage("prescriptionMessage", "Prescription <strong>" + escapeDoctorHtml(removedId) + "</strong> deleted.", "info");
}

function resetPrescriptionForm() {
  editPrescriptionIndex = -1;
  let form = document.getElementById("prescriptionForm");
  if (form) form.reset();
  clearErrors([
    "prescriptionPatient",
    "prescriptionDiagnosis",
    "prescriptionMedicine",
    "prescriptionDosage",
    "prescriptionFrequency",
    "prescriptionDuration",
    "prescriptionInstructions"
  ]);
  let title = document.getElementById("prescriptionFormTitle");
  let btn = document.getElementById("prescriptionSaveButton");
  if (title) title.innerHTML = "Create Prescription";
  if (btn) btn.value = "Save Prescription";
}

function getScheduleBadgeColor(status) {
  if (status === "Completed" || status === "Confirmed" || status === "Approved") return "green";
  if (status === "Scheduled") return "blue";
  if (status === "Rescheduled" || status === "Pending") return "orange";
  if (status === "Cancelled") return "red";
  return "grey";
}

function previewReschedule() {
  let statusSelect = document.getElementById("scheduleStatus");
  let dateInput = document.getElementById("scheduleDate");
  let rescheduledDateInput = document.getElementById("scheduleRescheduledDate");

  if (!statusSelect || !rescheduledDateInput) return;

  if (statusSelect.value === "Unavailable") {
    let baseDate = dateInput ? dateInput.value : "";
    rescheduledDateInput.value = baseDate ? computeNextCalendarDay(baseDate) : "";
  } else {
    rescheduledDateInput.value = "";
  }
}

function findOrCreateRescheduleNotifyId(appt, originalDate, originalTime, newDate, newTime, reason) {
  let notifyId = appt.notifyId && appt.notifyId !== "-" ? appt.notifyId : "";

  if (!notifyId && typeof reschedules !== "undefined") {
    for (let i = 0; i < reschedules.length; i++) {
      if (reschedules[i].appointmentId === appt.id && reschedules[i].notifyId) {
        notifyId = reschedules[i].notifyId;
        break;
      }
    }
  }

  let patientId = getPatientIdByName(appt.patient);
  let doctorName = appt.doctor || "Dr. Ahmed";
  let subject = "Appointment Rescheduled Notice (" + appt.id + ")";
  let messageText = "Your appointment (" + appt.id + ") with " + doctorName +
    " on " + originalDate + " at " + originalTime +
    " has been rescheduled to " + newDate + " at " + newTime +
    (reason ? ". Reason: " + reason : ".");

  if (typeof notifications !== "undefined") {
    let existingNotif = null;
    if (notifyId) {
      for (let i = 0; i < notifications.length; i++) {
        if (notifications[i].id === notifyId) {
          existingNotif = notifications[i];
          break;
        }
      }
    }

    if (existingNotif) {
      existingNotif.patient = appt.patient;
      existingNotif.patientId = patientId;
      existingNotif.type = "Reschedule";
      existingNotif.subject = subject;
      existingNotif.message = messageText;
      existingNotif.date = "2026-11-06";
      existingNotif.status = "Draft";
    } else {
      notifyId = nextId("NOT", notifications);
      notifications.push({
        id: notifyId,
        appointmentId: appt.id,
        patient: appt.patient,
        patientId: patientId,
        type: "Reschedule",
        channel: "SMS",
        subject: subject,
        message: messageText,
        date: "2026-11-06",
        status: "Draft"
      });
    }
  } else if (!notifyId) {
    notifyId = "NOT-001";
  }

  appt.notifyId = notifyId;

  if (typeof reschedules !== "undefined") {
    let found = -1;
    for (let i = 0; i < reschedules.length; i++) {
      if (reschedules[i].appointmentId === appt.id) {
        found = i;
        break;
      }
    }
    if (found !== -1) {
      reschedules[found].notifyId = notifyId;
      reschedules[found].patient = appt.patient;
      reschedules[found].originalDate = originalDate;
      reschedules[found].time = newTime;
      reschedules[found].newDate = newDate;
      reschedules[found].reason = reason;
      reschedules[found].status = "Rescheduled";
    } else {
      reschedules.push({
        id: nextId("RSC", reschedules),
        appointmentId: appt.id,
        notifyId: notifyId,
        patient: appt.patient,
        originalDate: originalDate,
        time: newTime,
        newDate: newDate,
        reason: reason,
        status: "Rescheduled"
      });
    }
  }

  return notifyId;
}

function getNotificationStatusLabel(notifyId) {
  if (!notifyId || notifyId === "-") return "-";
  if (typeof notifications !== "undefined") {
    for (let i = 0; i < notifications.length; i++) {
      if (notifications[i].id === notifyId) {
        let st = notifications[i].status || "Pending";
        let color = st === "Sent" ? "green" : "orange";
        return "<span class='badge " + color + "'>" + escapeDoctorHtml(notifyId) + " (" + escapeDoctorHtml(st) + ")</span>";
      }
    }
  }
  return "<span class='badge orange'>" + escapeDoctorHtml(notifyId) + "</span>";
}

function renderSchedule() {
  let tbody = document.getElementById("scheduleTableBody");
  if (!tbody || typeof appointments === "undefined") return;

  let searchBox = document.getElementById("scheduleSearch");
  let statusFilterBox = document.getElementById("scheduleStatusFilter");
  let keyword = searchBox ? searchBox.value.trim() : "";
  let statusFilter = statusFilterBox ? statusFilterBox.value : "All";

  let rows = "";
  let shown = 0;

  for (let i = 0; i < appointments.length; i++) {
    let a = appointments[i];
    let status = a.status || "Scheduled";
    let availability = a.availability || (status === "Rescheduled" || status === "Cancelled" ? "Unavailable" : "Available");
    let newDate = a.newDate || (availability === "Unavailable" && a.date ? computeNextCalendarDay(a.date) : "-");
    let notifyId = a.notifyId || "-";

    if (notifyId === "-" && typeof reschedules !== "undefined") {
      for (let r = 0; r < reschedules.length; r++) {
        if (reschedules[r].appointmentId === a.id && reschedules[r].notifyId) {
          notifyId = reschedules[r].notifyId;
          a.notifyId = notifyId;
          break;
        }
      }
    }

    let searchable = (a.id || "") + " " + (a.patient || "") + " " + (a.date || "") + " " + (a.time || "") + " " + notifyId + " " + status;
    let matchesKeyword = containsText(searchable, keyword);
    let matchesStatus = (statusFilter === "All" || !statusFilter || status === statusFilter);

    if (!matchesKeyword || !matchesStatus) continue;

    let availColor = availability === "Unavailable" ? "red" : "green";
    let statusColor = getScheduleBadgeColor(status);
    let notifyCell = getNotificationStatusLabel(notifyId);

    let actionHtml = "<button type='button' class='btn btn-small' onclick='editSchedule(" + i + ")'>Edit / Reschedule</button>";
    if (status !== "Completed" && status !== "Cancelled") {
      actionHtml += "<button type='button' class='btn btn-small btn-success' onclick='completeAppointment(" + i + ")'>Complete</button>";
      actionHtml += "<button type='button' class='btn btn-small btn-danger' onclick='cancelDoctorAppointment(" + i + ")'>Cancel</button>";
    }

    rows += "<tr>" +
      "<td>" + escapeDoctorHtml(a.id || "") + "</td>" +
      "<td>" + escapeDoctorHtml(a.patient || "") + "</td>" +
      "<td>" + escapeDoctorHtml(a.date || "") + "</td>" +
      "<td>" + escapeDoctorHtml(a.time || "") + "</td>" +
      "<td><span class='badge " + availColor + "'>" + escapeDoctorHtml(availability) + "</span></td>" +
      "<td>" + escapeDoctorHtml(newDate) + "</td>" +
      "<td>" + notifyCell + "</td>" +
      "<td><span class='badge " + statusColor + "'>" + escapeDoctorHtml(status) + "</span></td>" +
      "<td>" + actionHtml + "</td>" +
      "</tr>";
    shown++;
  }

  if (shown === 0) {
    rows = "<tr><td colspan='9' class='empty-row'>No appointments match your filter.</td></tr>";
  }
  tbody.innerHTML = rows;

  let count = document.getElementById("scheduleCount");
  if (count) count.innerHTML = "Showing " + shown + " of " + appointments.length + " appointments";
}

function editSchedule(index) {
  if (!appointments[index]) return;
  let a = appointments[index];
  editScheduleIndex = index;

  let patientField = document.getElementById("schedulePatient");
  let dateField = document.getElementById("scheduleDate");
  let timeField = document.getElementById("scheduleTime");
  let reasonField = document.getElementById("scheduleReason");

  if (patientField) patientField.value = a.patient || "";
  if (reasonField) reasonField.value = a.reason || "";

  if (a.status === "Rescheduled" && a.newDate && a.newDate !== "-") {
    if (dateField) dateField.value = a.newDate;
  } else {
    if (dateField) dateField.value = a.date || "";
  }

  if (timeField) timeField.value = a.time || "";

  let title = document.getElementById("scheduleFormTitle");
  let btn = document.getElementById("scheduleSaveButton");
  if (title) title.innerHTML = "Update / Reschedule " + escapeDoctorHtml(a.id || "");
  if (btn) btn.value = "Update Schedule";
  hideMessage("scheduleMessage");
}

function completeAppointment(index) {
  if (!appointments[index]) return;
  appointments[index].status = "Completed";
  appointments[index].availability = "Available";
  if (appointments[index].newDate && appointments[index].newDate !== "-") {
    appointments[index].date = appointments[index].newDate;
  }
  renderSchedule();
  showMessage("scheduleMessage", "Appointment <strong>" + escapeDoctorHtml(appointments[index].id) + "</strong> marked as Completed.", "success");
}

function cancelDoctorAppointment(index) {
  if (!appointments[index]) return;
  appointments[index].status = "Cancelled";
  appointments[index].availability = "Unavailable";
  renderSchedule();
  showMessage("scheduleMessage", "Appointment <strong>" + escapeDoctorHtml(appointments[index].id) + "</strong> has been Cancelled.", "info");
}

function saveSchedule() {
  let patientField = document.getElementById("schedulePatient");
  let dateField = document.getElementById("scheduleDate");
  let timeField = document.getElementById("scheduleTime");
  let reasonField = document.getElementById("scheduleReason");

  let patient = patientField ? patientField.value : "";
  let date = dateField ? dateField.value : "";
  let time = timeField ? timeField.value : "";
  let reason = reasonField ? reasonField.value.trim() : "";

  clearErrors(["schedulePatient", "scheduleDate", "scheduleTime", "scheduleReason"]);
  hideMessage("scheduleMessage");

  let valid = true;
  if (isEmpty(patient)) {
    showError("schedulePatient", "Please select a patient.");
    valid = false;
  }
  if (isEmpty(date)) {
    showError("scheduleDate", "Please select appointment date.");
    valid = false;
  }
  if (isEmpty(time)) {
    showError("scheduleTime", "Please select appointment time.");
    valid = false;
  }
  if (!valid) return false;

  let targetIndex = editScheduleIndex;

  if (targetIndex === -1) {
    let newAppt = {
      id: nextId("APT", appointments),
      patient: patient,
      doctor: "Dr. Ahmed",
      date: date,
      time: time,
      reason: reason || "Scheduled consultation",
      availability: "Available",
      newDate: "-",
      notifyId: "-",
      status: "Scheduled"
    };
    appointments.push(newAppt);
    showMessage("scheduleMessage", "Appointment <strong>" + escapeDoctorHtml(newAppt.id) + "</strong> added to schedule.", "success");
  } else {
    let appt = appointments[targetIndex];
    let currentActiveDate = (appt.status === "Rescheduled" && appt.newDate && appt.newDate !== "-") ? appt.newDate : appt.date;
    let oldTime = (appt.time || "").substring(0, 5);
    let newTime = time.substring(0, 5);

    let isDateChanged = currentActiveDate !== date;
    let isTimeChanged = oldTime !== newTime;

    appt.patient = patient;
    if (!isEmpty(reason)) {
      appt.reason = reason;
    }

    if (isDateChanged || isTimeChanged) {
      appt.availability = "Unavailable";
      appt.newDate = date;
      appt.status = "Rescheduled";

      let originalDate = appt.date;
      let notifyId = findOrCreateRescheduleNotifyId(appt, originalDate, oldTime, date, newTime, reason);

      appt.time = time; 

      showMessage("scheduleMessage", "Appointment <strong>" + escapeDoctorHtml(appt.id) + "</strong> rescheduled to <strong>" + escapeDoctorHtml(date) + "</strong> at <strong>" + escapeDoctorHtml(time) + "</strong>. Notify ID <strong>" + escapeDoctorHtml(notifyId) + "</strong> generated.", "success");
    } else {
      appt.status = "Scheduled";
      appt.availability = "Available";
      appt.newDate = "-";
      showMessage("scheduleMessage", "Appointment <strong>" + escapeDoctorHtml(appt.id) + "</strong> updated.", "success");
    }
  }

  resetScheduleForm();
  renderSchedule();
  return false;
}

function resetScheduleForm() {
  editScheduleIndex = -1;
  let form = document.getElementById("scheduleForm");
  if (form) form.reset();
  clearErrors(["schedulePatient", "scheduleDate", "scheduleTime", "scheduleReason"]);
  let title = document.getElementById("scheduleFormTitle");
  let btn = document.getElementById("scheduleSaveButton");
  if (title) title.innerHTML = "Manage / Reschedule Appointment";
  if (btn) btn.value = "Save Schedule";
}

function completeAppointment(index) {
  if (!appointments[index]) return;
  appointments[index].status = "Completed";
  appointments[index].availability = "Available";
  if (appointments[index].newDate && appointments[index].newDate !== "-") {
    appointments[index].date = appointments[index].newDate;
  }
  if (typeof saveSharedData === "function") saveSharedData();
  renderSchedule();
  showMessage("scheduleMessage", "Appointment <strong>" + escapeDoctorHtml(appointments[index].id) + "</strong> marked as Completed.", "success");
}

function cancelDoctorAppointment(index) {
  if (!appointments[index]) return;
  appointments[index].status = "Cancelled";
  appointments[index].availability = "Unavailable";
  if (typeof saveSharedData === "function") saveSharedData();
  renderSchedule();
  showMessage("scheduleMessage", "Appointment <strong>" + escapeDoctorHtml(appointments[index].id) + "</strong> has been Cancelled.", "info");
}

function saveSchedule() {
  let patientField = document.getElementById("schedulePatient");
  let dateField = document.getElementById("scheduleDate");
  let timeField = document.getElementById("scheduleTime");
  let reasonField = document.getElementById("scheduleReason");

  let patient = patientField ? patientField.value : "";
  let date = dateField ? dateField.value : "";
  let time = timeField ? timeField.value : "";
  let reason = reasonField ? reasonField.value.trim() : "";

  clearErrors(["schedulePatient", "scheduleDate", "scheduleTime", "scheduleReason"]);
  hideMessage("scheduleMessage");

  let valid = true;
  if (isEmpty(patient)) {
    showError("schedulePatient", "Please select a patient.");
    valid = false;
  }
  if (isEmpty(date)) {
    showError("scheduleDate", "Please select appointment date.");
    valid = false;
  }
  if (isEmpty(time)) {
    showError("scheduleTime", "Please select appointment time.");
    valid = false;
  }
  if (!valid) return false;

  let targetIndex = editScheduleIndex;

  if (targetIndex === -1) {
    let newAppt = {
      id: nextId("APT", appointments),
      patient: patient,
      doctor: "Dr. Ahmed",
      date: date,
      time: time,
      reason: reason || "Scheduled consultation",
      availability: "Available",
      newDate: "-",
      notifyId: "-",
      status: "Scheduled"
    };
    appointments.push(newAppt);
    showMessage("scheduleMessage", "Appointment <strong>" + escapeDoctorHtml(newAppt.id) + "</strong> added to schedule.", "success");
  }

  else {
    let appt = appointments[targetIndex];

    let activeDate = String(appt.status === "Rescheduled" && appt.newDate && appt.newDate !== "-" ? appt.newDate : appt.date).trim();
    let activeTime = String(appt.time || "").trim().substring(0, 5);
    let inputDate = String(date).trim();
    let inputTime = String(time).trim().substring(0, 5);
    let isDateChanged = (activeDate !== inputDate);
    let isTimeChanged = (activeTime !== inputTime);

    appt.patient = patient;
    if (!isEmpty(reason)) {
      appt.reason = reason;
    }

    if (isDateChanged || isTimeChanged) {
      appt.availability = "Unavailable";
      appt.newDate = inputDate;
      appt.status = "Rescheduled";

      let notifyId = findOrCreateRescheduleNotifyId(appt, appt.date, activeTime, inputDate, inputTime, reason);

      appt.time = inputTime;

      showMessage("scheduleMessage", "Appointment <strong>" + escapeDoctorHtml(appt.id) + "</strong> rescheduled. Notify ID <strong>" + escapeDoctorHtml(notifyId) + "</strong> generated.", "success");
    } else {
      showMessage("scheduleMessage", "Appointment <strong>" + escapeDoctorHtml(appt.id) + "</strong> schedule updated.", "success");
    }
  }

  resetScheduleForm();
  renderSchedule();
  return false;
}

function resetScheduleForm() {
  editScheduleIndex = -1;
  let form = document.getElementById("scheduleForm");
  if (form) form.reset();
  clearErrors(["schedulePatient", "scheduleDate", "scheduleTime", "scheduleReason"]);
  let title = document.getElementById("scheduleFormTitle");
  let btn = document.getElementById("scheduleSaveButton");
  if (title) title.innerHTML = "Manage / Reschedule Appointment";
  if (btn) btn.value = "Save Schedule";
}

function renderMedicalHistory() {
  let tbody = document.getElementById("medicalHistoryTableBody");
  if (!tbody || typeof medicalHistory === "undefined") return;

  let searchBox = document.getElementById("historySearch");
  let patientFilterBox = document.getElementById("historyPatientFilter");
  let keyword = searchBox ? searchBox.value.trim() : "";
  let patientFilter = patientFilterBox ? patientFilterBox.value : "All";

  let rows = "";
  let shown = 0;

  for (let i = 0; i < medicalHistory.length; i++) {
    let h = medicalHistory[i];
    let patientName = h.patient || h.patientName || "";
    let searchable = (h.id || "") + " " + (h.patientId || "") + " " + patientName + " " + (h.visitDate || "") + " " + (h.diagnosis || "") + " " + (h.treatment || "") + " " + (h.doctor || "");

    let matchesKeyword = containsText(searchable, keyword);
    let matchesPatient = (patientFilter === "All" || !patientFilter || patientName === patientFilter);

    if (!matchesKeyword || !matchesPatient) continue;

    rows += "<tr>" +
      "<td>" + escapeDoctorHtml(h.id || "") + "</td>" +
      "<td>" + escapeDoctorHtml(h.patientId || "") + "</td>" +
      "<td>" + escapeDoctorHtml(patientName) + "</td>" +
      "<td>" + escapeDoctorHtml(h.visitDate || "") + "</td>" +
      "<td>" + escapeDoctorHtml(h.diagnosis || "") + "</td>" +
      "<td>" + escapeDoctorHtml(h.treatment || "") + "</td>" +
      "<td>" + escapeDoctorHtml(h.doctor || "") + "</td>" +
      "<td><button type='button' class='btn btn-small' onclick='selectPatientForDownload(\"" + escapeDoctorHtml(h.patientId || "") + "\")'>Print / PDF</button></td>" +
      "</tr>";
    shown++;
  }

  if (shown === 0) {
    rows = "<tr><td colspan='8' class='empty-row'>No medical history found.</td></tr>";
  }
  tbody.innerHTML = rows;

  let count = document.getElementById("historyCount");
  if (count) count.innerHTML = "Showing " + shown + " of " + medicalHistory.length + " medical history records";
}

function selectPatientForDownload(patientId) {
  let select = document.getElementById("historyDownloadPatient");
  if (select) {
    select.value = patientId;
  }
  downloadPatientHistory();
}

function downloadPatientHistory() {
  let patientSelect = document.getElementById("historyDownloadPatient");
  let formatSelect = document.getElementById("historyDownloadFormat");

  clearError("historyDownloadPatient");
  hideMessage("historyMessage");

  let selectedPatientId = patientSelect ? patientSelect.value : "";
  let format = formatSelect ? formatSelect.value : "print";

  if (isEmpty(selectedPatientId)) {
    showError("historyDownloadPatient", "Please select a patient to download medical history.");
    return false;
  }

  let matchingRecords = [];
  let patientName = selectedPatientId;
  for (let i = 0; i < medicalHistory.length; i++) {
    if (medicalHistory[i].patientId === selectedPatientId) {
      matchingRecords.push(medicalHistory[i]);
      patientName = medicalHistory[i].patient || medicalHistory[i].patientName || selectedPatientId;
    }
  }

  if (matchingRecords.length === 0) {
    showMessage("historyMessage", "No medical history records found for patient ID <strong>" + escapeDoctorHtml(selectedPatientId) + "</strong>.", "error");
    return false;
  }

  let modeLabel = format === "pdf" ? "Print-to-PDF" : "Print";
  let tableRows = "";
  for (let i = 0; i < matchingRecords.length; i++) {
    let r = matchingRecords[i];
    tableRows += "<tr>" +
      "<td>" + escapeDoctorHtml(r.id) + "</td>" +
      "<td>" + escapeDoctorHtml(r.visitDate) + "</td>" +
      "<td>" + escapeDoctorHtml(r.diagnosis) + "</td>" +
      "<td>" + escapeDoctorHtml(r.treatment) + "</td>" +
      "<td>" + escapeDoctorHtml(r.doctor) + "</td>" +
      "</tr>";
  }

  let printHtml = "<!DOCTYPE html><html><head><meta charset='UTF-8'>" +
    "<title>CareNest Medical History - " + escapeDoctorHtml(patientName) + " (" + escapeDoctorHtml(selectedPatientId) + ")</title>" +
    "<style>" +
    "body { font-family: Arial, sans-serif; padding: 24px; color: #222; }" +
    "h1 { color: #1B5E20; margin-bottom: 4px; }" +
    "p { margin: 4px 0 14px 0; color: #444; }" +
    "table { width: 100%; border-collapse: collapse; margin-top: 16px; }" +
    "th, td { border: 1px solid #C5D6CA; padding: 10px; text-align: left; }" +
    "th { background-color: #1B5E20; color: white; }" +
    "</style></head><body>" +
    "<h1>CareNest Hospital - Patient Medical History (" + escapeDoctorHtml(modeLabel) + ")</h1>" +
    "<p><strong>Patient Name:</strong> " + escapeDoctorHtml(patientName) + " &nbsp;|&nbsp; <strong>Patient ID:</strong> " + escapeDoctorHtml(selectedPatientId) + "</p>" +
    "<table><thead><tr><th>Record ID</th><th>Visit Date</th><th>Diagnosis</th><th>Treatment</th><th>Doctor</th></tr></thead>" +
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

  showMessage("historyMessage", "Opened browser print dialog (" + escapeDoctorHtml(modeLabel) + ") with " + matchingRecords.length + " record(s) for <strong>" + escapeDoctorHtml(patientName) + "</strong>.", "success");
  return false;
}
function renderAdminMessages() {
  let tbody = document.getElementById("adminMessagesTableBody");
  if (!tbody || typeof meetings === "undefined") return;

  let currentDoctor = "Dr. Ahmed";
  let rows = "";
  let shown = 0;

  for (let i = 0; i < meetings.length; i++) {
    let m = meetings[i];

    if (m.doctor !== currentDoctor) continue;

    rows += "<tr>" +
      "<td>" + escapeDoctorHtml(m.id || "") + "</td>" +
      "<td>" + escapeDoctorHtml(m.doctor || "") + "</td>" +
      "<td><strong>" + escapeDoctorHtml(m.subject || "") + "</strong></td>" +
      "<td>" + escapeDoctorHtml(m.date || "") + "</td>" +
      "<td>" + escapeDoctorHtml(m.time || "") + "</td>" +
      "<td>" + escapeDoctorHtml(m.message || "") + "</td>" +
      "</tr>";
    shown++;
  }

  if (shown === 0) {
    rows = "<tr><td colspan='6' class='empty-row'>No messages from Admin.</td></tr>";
  }
  tbody.innerHTML = rows;
}

if (document.getElementById("nav-prescriptionsSection")) {
  showSection("prescriptionsSection");
  renderPrescriptions();
  renderSchedule();
  renderMedicalHistory();
  renderAdminMessages();
}
