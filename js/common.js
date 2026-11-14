function showSection(sectionId) {
  if (typeof sections !== 'undefined') {
    for (let i = 0; i < sections.length; i++) {
      let section = document.getElementById(sections[i]);
      let navButton = document.getElementById("nav-" + sections[i]);
      if (section && navButton) {
        if (sections[i] === sectionId) {
          section.style.display = "block";
          navButton.className = "active";
        } else {
          section.style.display = "none";
          navButton.className = "";
        }
      }
    }
  }
}

function showError(fieldId, message) {
  let errorElement = document.getElementById(fieldId + "Error");
  if (errorElement) { errorElement.innerHTML = message; }
  let field = document.getElementById(fieldId);
  if (field != null) { field.style.border = "2px solid red"; }
}

function clearError(fieldId) {
  let errorElement = document.getElementById(fieldId + "Error");
  if (errorElement) { errorElement.innerHTML = ""; }
  let field = document.getElementById(fieldId);
  if (field != null) { field.style.border = ""; }
}

function clearErrors(fieldIds) {
  for (let i = 0; i < fieldIds.length; i++) {
    clearError(fieldIds[i]);
  }
}

function showMessage(boxId, text, type) {
  let box = document.getElementById(boxId);
  if (box) {
    box.innerHTML = text;
    box.className = "message " + type;
    box.style.display = "block";
  }
}

function hideMessage(boxId) {
  let box = document.getElementById(boxId);
  if (box) { box.style.display = "none"; }
}

function isEmpty(value) {
  return String(value || "").trim() === "";
}

function containsText(text, keyword) {
  return String(text || "").toLowerCase().indexOf(String(keyword || "").toLowerCase()) !== -1;
}

function nextId(prefix, list) {
  let biggest = 0;
  let digits = 3;
  let exactPrefix = prefix + "-";
  if (list && list.length > 0) {
    for (let i = 0; i < list.length; i++) {
      let item = list[i];
      if (item && item.id && String(item.id).indexOf(exactPrefix) === 0) {
        let numberText = String(item.id).slice(exactPrefix.length);
        let parsed = Number(numberText);
        if (!isNaN(parsed)) {
          if (numberText.length > 0) {
            digits = numberText.length;
          }
          if (parsed > biggest) {
            biggest = parsed;
          }
        }
      }
    }
  }
  let newNumber = String(biggest + 1);
  while (newNumber.length < digits) {
    newNumber = "0" + newNumber;
  }
  return exactPrefix + newNumber;
}
