let users = [
  { id: "U-001", name: "Rifat Hasan", username: "admin", password: "admin1234", email: "admin@cnh.com", role: "Admin", status: "Active" },
  { id: "U-002", name: "Dr. Ahmed", username: "doctor", password: "doctor123", email: "ahmed@cnh.com", role: "Doctor", status: "Active" },
  { id: "U-003", name: "Shirin Akter", username: "receptionist", password: "reception123", email: "shirin@cnh.com", role: "Receptionist", status: "Active" },
  { id: "U-004", name: "Dr. Sarah", username: "sarah", password: "doctor123", email: "sarah@cnh.com", role: "Doctor", status: "Active" },
  { id: "U-005", name: "Dr. Hasan", username: "hasan", password: "doctor123", email: "hasan@cnh.com", role: "Doctor", status: "Active" },
  { id: "U-006", name: "Dr. Nusrat", username: "nusrat_doc", password: "doctor123", email: "nusrat.doc@cnh.com", role: "Doctor", status: "Active" },
  { id: "U-007", name: "Dr. Rahman", username: "rahman", password: "doctor123", email: "rahman@cnh.com", role: "Doctor", status: "Active" },
  { id: "U-008", name: "Tanvir Alam", username: "tanvir_rec", password: "reception123", email: "tanvir@cnh.com", role: "Receptionist", status: "Blocked" },
  { id: "PAT-001", name: "Rahim Uddin", username: "patient", password: "patient123", email: "rahim@cnh.com", role: "Patient", status: "Active" },
  { id: "PAT-002", name: "Nusrat Jahan", username: "nusrat", password: "patient123", email: "nusrat@cnh.com", role: "Patient", status: "Active" },
  { id: "PAT-003", name: "Sakib Hasan", username: "sakib", password: "patient123", email: "sakib@cnh.com", role: "Patient", status: "Active" }
];

let doctors = [
  { id: "D-101", name: "Dr. Ahmed", specialization: "Cardiology", department: "Cardiology", category: "Cardiology", experience: "10 Years", availableDays: "Mon, Wed, Fri", fee: 1000, rating: 4.8 },
  { id: "D-102", name: "Dr. Sarah", specialization: "Dermatology", department: "Dermatology", category: "Dermatology", experience: "7 Years", availableDays: "Sun, Tue, Thu", fee: 800, rating: 4.6 },
  { id: "D-103", name: "Dr. Hasan", specialization: "Medicine", department: "Neurology", category: "Neurology", experience: "12 Years", availableDays: "Sat, Mon, Wed", fee: 900, rating: 4.7 },
  { id: "D-104", name: "Dr. Nusrat", specialization: "Pediatrics", department: "Pediatrics", category: "Pediatrics", experience: "8 Years", availableDays: "Sun, Tue, Thu", fee: 850, rating: 4.9 },
  { id: "D-105", name: "Dr. Rahman", specialization: "Orthopedics", department: "Orthopedics", category: "Orthopedics", experience: "15 Years", availableDays: "Mon, Wed, Sat", fee: 1200, rating: 4.7 }
];

let appointments = [
  { id: "APT-001", patient: "Rahim Uddin", doctor: "Dr. Ahmed", date: "2026-11-10", time: "10:00", reason: "Chest pain and routine cardiac checkup", status: "Scheduled", availability: "Available", newDate: "-", notifyId: "NOT-001" },
  { id: "APT-002", patient: "Rahim Uddin", doctor: "Dr. Sarah", date: "2026-11-12", time: "11:30", reason: "Skin allergy consultation", status: "Pending", availability: "Available", newDate: "-", notifyId: "-" },
  { id: "APT-006", patient: "Rahim Uddin", doctor: "Dr. Sarah", date: "2026-12-12", time: "11:00", reason: "Heart pain", status: "Pending", availability: "Available", newDate: "-", notifyId: "-" },
  { id: "APT-003", patient: "Rahim Uddin", doctor: "Dr. Hasan", date: "2026-10-25", time: "09:30", reason: "Seasonal fever follow-up", status: "Completed", availability: "Available", newDate: "-", notifyId: "-" },
  { id: "APT-004", patient: "Nusrat Jahan", doctor: "Dr. Nusrat", date: "2026-11-14", time: "14:00", reason: "Child wellness and vaccination check", status: "Confirmed", availability: "Available", newDate: "-", notifyId: "-" },
  { id: "APT-005", patient: "Sakib Hasan", doctor: "Dr. Rahman", date: "2026-11-15", time: "16:00", reason: "Knee joint pain evaluation", status: "Rescheduled", availability: "Unavailable", newDate: "2026-11-16", notifyId: "NOT-003" }
];

let ambulances = [
  { id: "AMB-001", patient: "Rahim Uddin", phone: "01711000004", location: "Banani, Road 11, Dhaka", destination: "CareNest Hospital", type: "AC", assignedAmbulance: "CNH-AMB-02", date: "2026-11-06", time: "09:00", status: "Pending" },
  { id: "AMB-002", patient: "Rahim Uddin", phone: "01711000004", location: "Uttara Sector 7, Dhaka", destination: "CareNest Hospital", type: "Basic Life Support", assignedAmbulance: "CNH-AMB-01", date: "2026-10-20", time: "14:30", status: "Completed" },
  { id: "AMB-003", patient: "Nusrat Jahan", phone: "01812000005", location: "Mirpur 10, Dhaka", destination: "CareNest Hospital", type: "ICU", assignedAmbulance: "CNH-AMB-04", date: "2026-11-07", time: "18:15", status: "Approved" },
  { id: "AMB-004", patient: "Sakib Hasan", phone: "01913000006", location: "Dhanmondi 27, Dhaka", destination: "CareNest Hospital", type: "General", assignedAmbulance: "CNH-AMB-03", date: "2026-11-08", time: "08:00", status: "Dispatched" }
];

let reviews = [
  { id: "REV-001", patient: "Rahim Uddin", doctor: "Dr. Ahmed", rating: 5, comment: "Very attentive cardiologist, explained the ECG report clearly.", date: "2026-10-28", status: "Pending" },
  { id: "REV-002", patient: "Rahim Uddin", doctor: "Dr. Sarah", rating: 4, comment: "Effective treatment and polite behavior during consultation.", date: "2026-10-30", status: "Reviewed" },
  { id: "REV-003", patient: "Nusrat Jahan", doctor: "Dr. Nusrat", rating: 5, comment: "Wonderful care with children and very helpful advice.", date: "2026-11-01", status: "Pending" },
  { id: "REV-004", patient: "Sakib Hasan", doctor: "Dr. Rahman", rating: 4, comment: "Thorough orthopedic examination and clear physiotherapy plan.", date: "2026-11-02", status: "Reviewed" }
];

let meetings = [
  { id: "MTG-001", doctor: "Dr. Ahmed", subject: "Monthly Cardiology Patient Feedback", date: "2026-11-18", time: "13:00", message: "Review recent patient ratings and waiting time improvements." },
  { id: "MTG-002", doctor: "Dr. Ahmed", subject: "Pediatric Clinic Queue Coordination", date: "2026-11-20", time: "15:00", message: "Discuss morning slot allocation for vaccination visits." }
];

let prescriptions = [
  { id: "PRX-001", patient: "Rahim Uddin", diagnosis: "Mild Hypertension", medicine: "Amlodipine", dosage: "5 mg", frequency: "Once daily", duration: "30 days", instructions: "Take after breakfast and monitor blood pressure." },
  { id: "PRX-002", patient: "Nusrat Jahan", diagnosis: "Allergic Rhinitis", medicine: "Fexofenadine", dosage: "120 mg", frequency: "Once daily", duration: "10 days", instructions: "Take at night before sleep." },
  { id: "PRX-003", patient: "Sakib Hasan", diagnosis: "Acute Knee Strain", medicine: "Naproxen", dosage: "250 mg", frequency: "Twice daily", duration: "5 days", instructions: "Take after meals with plenty of water." }
];

let reschedules = [
  { id: "RSC-001", appointmentId: "APT-005", notifyId: "NOT-003", patient: "Sakib Hasan", originalDate: "2026-11-15", time: "16:00", newDate: "2026-11-16", reason: "Emergency orthopedic surgery schedule", status: "Pending Receptionist" },
  { id: "RSC-002", appointmentId: "APT-001", notifyId: "NOT-001", patient: "Rahim Uddin", originalDate: "2026-11-09", time: "10:00", newDate: "2026-11-10", reason: "Cardiology conference attendance", status: "Patient Notified" }
];

let medicalHistory = [
  { id: "HIS-001", patientId: "PAT-001", patient: "Rahim Uddin", visitDate: "2026-10-25", diagnosis: "Mild Hypertension", treatment: "Amlodipine 5 mg daily and low-sodium diet", doctor: "Dr. Ahmed" },
  { id: "HIS-002", patientId: "PAT-001", patient: "Rahim Uddin", visitDate: "2026-09-14", diagnosis: "Seasonal Viral Fever", treatment: "Paracetamol 500 mg and oral hydration", doctor: "Dr. Hasan" },
  { id: "HIS-003", patientId: "PAT-002", patient: "Nusrat Jahan", visitDate: "2026-10-19", diagnosis: "Allergic Dermatitis", treatment: "Topical soothing lotion and antihistamine", doctor: "Dr. Sarah" },
  { id: "HIS-004", patientId: "PAT-003", patient: "Sakib Hasan", visitDate: "2026-10-30", diagnosis: "Ligament Sprain", treatment: "Knee brace support and physiotherapy", doctor: "Dr. Rahman" }
];

let queue = [
  { id: "QUE-001", patient: "Rahim Uddin", patientId: "PAT-001", phone: "01711000004", doctor: "Dr. Ahmed", visitType: "Appointment", date: "2026-11-05", time: "09:30", arrival: "2026-11-05 09:30", status: "Waiting" },
  { id: "QUE-002", patient: "Nusrat Jahan", patientId: "PAT-002", phone: "01812000005", doctor: "Dr. Nusrat", visitType: "Walk-in", date: "2026-11-05", time: "10:15", arrival: "2026-11-05 10:15", status: "In Consultation" },
  { id: "QUE-003", patient: "Sakib Hasan", patientId: "PAT-003", phone: "01913000006", doctor: "Dr. Rahman", visitType: "Appointment", date: "2026-11-05", time: "08:45", arrival: "2026-11-05 08:45", status: "Completed" }
];

let bills = [
  { id: "BIL-001", patient: "Rahim Uddin", patientId: "PAT-001", type: "Doctor Visit", description: "Doctor Visit - Cardiology Consultation", total: 1000, paid: 1000, due: 0, date: "2026-10-25", status: "Paid", paymentMethod: "bKash", paymentDate: "2026-10-25", transactionId: "TXN-101" },
  { id: "BIL-002", patient: "Rahim Uddin", patientId: "PAT-001", type: "Re-visit for Report", description: "Re-visit for Report Showing", total: 500, paid: 0, due: 500, date: "2026-11-02", status: "Unpaid", paymentMethod: "", paymentDate: "", transactionId: "" },
  { id: "BIL-003", patient: "Rahim Uddin", patientId: "PAT-001", type: "Doctor Visit", description: "Doctor Visit - General Medicine", total: 900, paid: 0, due: 900, date: "2026-11-04", status: "Unpaid", paymentMethod: "", paymentDate: "", transactionId: "" },
  { id: "BIL-004", patient: "Nusrat Jahan", patientId: "PAT-002", type: "Doctor Visit", description: "Doctor Visit - Pediatric Consultation", total: 850, paid: 850, due: 0, date: "2026-11-01", status: "Paid", paymentMethod: "Card", paymentDate: "2026-11-01", transactionId: "TXN-103" },
  { id: "BIL-005", patient: "Sakib Hasan", patientId: "PAT-003", type: "Re-visit for Report", description: "Re-visit for Report Showing", total: 600, paid: 0, due: 600, date: "2026-11-03", status: "Unpaid", paymentMethod: "", paymentDate: "", transactionId: "" }
];

let notifications = [
  { id: "NOT-001", patient: "Rahim Uddin", patientId: "PAT-001", type: "Appointment", channel: "SMS", subject: "Upcoming Cardiology Appointment", message: "Reminder: Your appointment with Dr. Ahmed is scheduled on 2026-11-10 at 10:00.", date: "2026-11-04", status: "Sent" },
  { id: "NOT-002", patient: "Nusrat Jahan", patientId: "PAT-002", type: "Queue", channel: "In-app", subject: "Queue Check-In Confirmed", message: "You have been checked into the queue for Dr. Nusrat.", date: "2026-11-05", status: "Ready" },
  { id: "NOT-003", patient: "Rahim Uddin", patientId: "PAT-001", type: "Reschedule", channel: "SMS", subject: "Appointment Rescheduled Notice", message: "Your appointment with Dr. Ahmed has been rescheduled to 2026-11-11 at 10:00.", date: "2026-11-05", status: "Sent" }
];

let activityLog = [
  { id: "LOG-001", user: "admin", action: "Initialized hospital dashboard statistics", date: "2026-11-05 08:30" },
  { id: "LOG-002", user: "doctor", action: "Created prescription PRX-001 for Rahim Uddin", date: "2026-11-05 09:15" },
  { id: "LOG-003", user: "receptionist", action: "Checked in Rahim Uddin to queue QUE-001", date: "2026-11-05 09:30" }
];

