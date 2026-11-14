function renderCatalog() {
  let rows = "";
  let shown = 0;

  for (let i = 0; i < doctors.length; i++) {
    let doc = doctors[i];
    
    rows += "<tr>" +
      "<td><strong>" + doc.name + "</strong></td>" +
      "<td>" + doc.specialization + "</td>" +
      "<td>" + doc.department + "</td>" +
      "<td>" + doc.experience + "</td>" +
      "<td>" + doc.availableDays + "</td>" +
      "<td><span class='badge green'>Available</span></td>" +
      "</tr>";
    shown++;
  }

  if (shown === 0) {
    rows = "<tr><td colspan='6' class='empty-row'>No doctors available.</td></tr>";
  }

  let catalogBody = document.getElementById("catalogBody");
  if (catalogBody) { catalogBody.innerHTML = rows; }
  
  let catalogCount = document.getElementById("catalogCount");
  if (catalogCount) { catalogCount.innerHTML = shown + " doctor(s) found"; }
}

if (document.getElementById("catalogBody")) {
  renderCatalog();
}

document.querySelectorAll('.topnav a').forEach(link => {
  link.addEventListener('click', function () {
    document.querySelectorAll('.topnav a').forEach(nav => nav.classList.remove('active'));
    this.classList.add('active');
  });
});