function safe(v) {
  return v && String(v).trim() !== '' ? String(v) : 'Not provided';
}

function showSection(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
}

function filterTable(q, tableId) {
  const rows = document.querySelectorAll(`#${tableId} tbody tr`);
  rows.forEach(r => r.style.display = r.innerText.toLowerCase().includes(q.toLowerCase()) ? '' : 'none');
}

function logout() {
  localStorage.removeItem('token');
  location.href = 'sign-in.html';
}

async function loadProfile() {
  const token = localStorage.getItem('token');
  if (!token) { location.href = 'sign-in.html'; return; }

  try {
    const res = await fetch('http://localhost:5000/api/auth/me', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (!res.ok) { localStorage.removeItem('token'); location.href = 'sign-in.html'; return; }

    const j = await res.json();
    fillProfile(j);
    fillVisits(j.visits || []);
    fillMeds(j.medications || []);
    fillReports(j.reports || []);
    fillAppts(j.appointments || []);
    fillDoctors(j.doctors || []);
    prefillForm('updateProfileForm', j);
  } catch (err) {
    console.error('Profile load error', err);
    alert('Unable to load profile. Try logging in again.');
    localStorage.removeItem('token');
    location.href = 'sign-in.html';
  }
}

function fillProfile(j) {
  const table = document.getElementById('profileTable');
  const rows = [
    ['Full name', safe((j.firstName || '') + ' ' + (j.lastName || ''))],
    ['Email', safe(j.email)],
    ['Phone', safe(j.phone)],
    ['Date of Birth', safe(j.dob)],
    ['Aadhaar', safe(j.aadhaar)],
    ['PAN', safe(j.pan)],
    ['Address', safe(j.address)],
    ['Blood Group', safe(j.blood)],
    ['Medical Conditions', safe(j.conditions)],
    ['Current Medications', safe(j.medications)],
    ['Emergency Contact Name', safe(j.emergencyName)],
    ['Emergency Contact Phone', safe(j.emergencyPhone)]
  ];
  table.innerHTML = '<tr><th>Detail</th><th>Information</th></tr>' +
    rows.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('');

  const qrImg = document.getElementById('qrImg');
  const qrAlt = document.getElementById('qrAlt');
  if (j.qrCode) {
    qrImg.src = j.qrCode;
    qrAlt.textContent = 'Scan this QR for emergency access';
  } else {
    qrImg.src = 'assets/placeholder-qr.png';
    qrAlt.textContent = 'QR not available';
  }
}

function fillVisits(visits) {
  const tbody = document.querySelector('#visitTable tbody');
  tbody.innerHTML = visits.length ? visits.map(v => `<tr>
    <td>${safe(v.date)}</td><td>${safe(v.hospital || v.facility)}</td>
    <td>${safe(v.reason)}</td><td>${safe(v.doctor)}</td><td>${safe(v.notes)}</td>
  </tr>`).join('') : '<tr><td colspan="5">No visit history available.</td></tr>';
}

function fillMeds(meds) {
  if (!meds || meds.length === 0) {
    document.querySelector('#medTable tbody').innerHTML = '<tr><td colspan="4">No medications available.</td></tr>';
    return;
  }
  const rows = Array.isArray(meds) ? meds : meds.split(',').map(m => ({ medication: m.trim() }));
  document.querySelector('#medTable tbody').innerHTML = rows.map(m => `<tr>
    <td>${safe(m.medication || m)}</td><td>${safe(m.reason || '')}</td>
    <td>${safe(m.dosage || '')}</td><td>${safe(m.time || '')}</td>
  </tr>`).join('');
}

function fillReports(reports) {
  if (!reports || reports.length === 0) {
    document.querySelector('#reportTable tbody').innerHTML = '<tr><td colspan="4">No reports available.</td></tr>';
    return;
  }
  document.querySelector('#reportTable tbody').innerHTML = reports.map(r => `<tr>
    <td>${safe(r.date)}</td><td>${safe(r.testName || r.name)}</td>
    <td>${safe(r.result)}</td><td>${safe(r.remarks)}</td>
  </tr>`).join('');
}

function fillAppts(appts) {
  if (!appts || appts.length === 0) {
    document.querySelector('#apptTable tbody').innerHTML = '<tr><td colspan="4">No appointments available.</td></tr>';
    return;
  }
  document.querySelector('#apptTable tbody').innerHTML = appts.map(a => `<tr>
    <td>${safe(a.date)}</td><td>${safe(a.doctor)}</td>
    <td>${safe(a.specialty)}</td><td>${safe(a.status)}</td>
  </tr>`).join('');
}

function fillDoctors(docs) {
  if (!docs || docs.length === 0) {
    document.querySelector('#docTable tbody').innerHTML = '<tr><td colspan="4">No doctors available.</td></tr>';
    return;
  }
  document.querySelector('#docTable tbody').innerHTML = docs.map(d => `<tr>
    <td>${safe(d.name)}</td><td>${safe(d.specialty)}</td>
    <td>${safe(d.phone)}</td><td>${safe(d.email)}</td>
  </tr>`).join('');
}


function prefillForm(formId, j) {
  const f = document.getElementById(formId);
  Object.keys(j).forEach(k => { if (f[k]) f[k].value = j[k] || ''; });
}

function resetForm(formId) {
  document.getElementById(formId).reset();
  if (document.getElementById('updateMsg')) {
    document.getElementById('updateMsg').textContent = '';
  }
}


document.getElementById('updateProfileForm').addEventListener('submit', async e => {
  e.preventDefault();
  const token = localStorage.getItem('token');
  const body = {};
  new FormData(e.target).forEach((v, k) => body[k] = v);

  try {
    const res = await fetch('http://localhost:5000/api/auth/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error('Update failed');
    document.getElementById('updateMsg').textContent = 'Profile updated successfully.';
    loadProfile();
    showSection('emergency');
  } catch (err) {
    document.getElementById('updateMsg').textContent = 'Update failed: ' + err.message;
  }
});

// -------------------------------
document.getElementById('updateSectionsForm').addEventListener('submit', async e => {
  e.preventDefault();
  const token = localStorage.getItem('token');
  const body = {};
  new FormData(e.target).forEach((value, key) => {
    if (value.trim() !== "") body[key] = value.trim();
  });

  try {
    const res = await fetch('http://localhost:5000/api/medical/update', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Update failed');

    alert('Sections updated successfully!');

    // Refresh only updated sections
    fillVisits(data.user.visits || []);
    fillReports(data.user.reports || []);
    fillMeds(data.user.medications || []);
    fillAppts(data.user.appointments || []);
    fillDoctors(data.user.doctors || []);

    showSection('visits');
  } catch (err) {
    alert('Error updating details: ' + err.message);
  }
});


loadProfile();
