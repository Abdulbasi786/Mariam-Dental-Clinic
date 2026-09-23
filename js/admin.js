/* ============================================
   Admin panel logic
   NOTE: This password check is client-side only and is
   NOT real security — anyone who views the page source can
   find it. It's a basic gate to keep casual visitors out,
   not a substitute for real authentication.
   ============================================ */

const ADMIN_PASSWORD = 'marium2026'; // TODO: replace with real auth before production use

document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('admin-dashboard')) return;

  // ---- Login gate ----
  const gate = document.getElementById('admin-gate');
  const dashboard = document.getElementById('admin-dashboard');
  const pwInput = document.getElementById('admin-password');
  const gateError = document.getElementById('admin-gate-error');

  function tryLogin() {
    if (pwInput.value === ADMIN_PASSWORD) {
      gate.style.display = 'none';
      dashboard.classList.add('show');
      sessionStorage.setItem('md_admin_authed', '1');
      renderServices();
      renderDoctors();
      renderAppointments();
    } else {
      gateError.classList.add('show');
    }
  }

  document.getElementById('admin-login-btn').addEventListener('click', tryLogin);
  pwInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') tryLogin(); });

  if (sessionStorage.getItem('md_admin_authed') === '1') {
    gate.style.display = 'none';
    dashboard.classList.add('show');
    renderServices();
    renderDoctors();
    renderAppointments();
  }

  // ---- Tabs ----
  document.querySelectorAll('.admin-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab').forEach((t) => t.classList.remove('active'));
      document.querySelectorAll('.admin-panel').forEach((p) => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('panel-' + tab.dataset.tab).classList.add('active');
    });
  });

  // ================= SERVICES =================
  const svcForm = document.getElementById('add-service-form');
  const svcNameEl = document.getElementById('svc-name');
  const svcDurationEl = document.getElementById('svc-duration');
  const svcBlurbEl = document.getElementById('svc-blurb');
  let editingServiceId = null;

  document.getElementById('toggle-add-service').addEventListener('click', () => {
    editingServiceId = null;
    svcForm.reset();
    svcForm.querySelector('h3').textContent = 'New service';
    svcForm.classList.toggle('show');
  });
  document.getElementById('cancel-add-service').addEventListener('click', () => svcForm.classList.remove('show'));

  svcForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = { name: svcNameEl.value.trim(), duration: svcDurationEl.value.trim(), blurb: svcBlurbEl.value.trim() };
    if (!data.name || !data.duration || !data.blurb) return;

    if (editingServiceId) {
      MDStore.updateService(editingServiceId, data);
    } else {
      MDStore.addService(data);
    }
    svcForm.reset();
    svcForm.classList.remove('show');
    editingServiceId = null;
    renderServices();
  });

  function renderServices() {
    const tbody = document.querySelector('#services-table tbody');
    const services = MDStore.getServices();
    if (!services.length) {
      tbody.innerHTML = `<tr><td colspan="4"><div class="empty-state">No services yet.</div></td></tr>`;
      return;
    }
    tbody.innerHTML = services.map((s) => `
      <tr>
        <td>${escapeHtml(s.name)}</td>
        <td>${escapeHtml(s.duration)}</td>
        <td>${escapeHtml(s.blurb)}</td>
        <td class="actions">
          <button class="btn btn-ghost btn-small" data-edit-service="${s.id}">Edit</button>
          <button class="btn btn-danger btn-small" data-delete-service="${s.id}">Delete</button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('[data-edit-service]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const s = MDStore.getServices().find((x) => x.id === btn.dataset.editService);
        if (!s) return;
        editingServiceId = s.id;
        svcNameEl.value = s.name;
        svcDurationEl.value = s.duration;
        svcBlurbEl.value = s.blurb;
        svcForm.querySelector('h3').textContent = 'Edit service';
        svcForm.classList.add('show');
        svcForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });
    tbody.querySelectorAll('[data-delete-service]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (confirm('Delete this service?')) {
          MDStore.deleteService(btn.dataset.deleteService);
          renderServices();
        }
      });
    });
  }

  // ================= DOCTORS =================
  const docForm = document.getElementById('add-doctor-form');
  const docNameEl = document.getElementById('doc-name');
  const docSpecialtyEl = document.getElementById('doc-specialty');
  const docDaysEl = document.getElementById('doc-days');
  const docPhoneEl = document.getElementById('doc-phone');
  let editingDoctorId = null;

  document.getElementById('toggle-add-doctor').addEventListener('click', () => {
    editingDoctorId = null;
    docForm.reset();
    docForm.querySelector('h3').textContent = 'New doctor';
    docForm.classList.toggle('show');
  });
  document.getElementById('cancel-add-doctor').addEventListener('click', () => docForm.classList.remove('show'));

  docForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = {
      name: docNameEl.value.trim(),
      specialty: docSpecialtyEl.value.trim(),
      days: docDaysEl.value.trim(),
      phone: docPhoneEl.value.trim(),
    };
    if (!data.name) return;

    if (editingDoctorId) {
      MDStore.updateDoctor(editingDoctorId, data);
    } else {
      MDStore.addDoctor(data);
    }
    docForm.reset();
    docForm.classList.remove('show');
    editingDoctorId = null;
    renderDoctors();
  });

  function renderDoctors() {
    const tbody = document.querySelector('#doctors-table tbody');
    const doctors = MDStore.getDoctors();
    if (!doctors.length) {
      tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state">No doctors added yet.</div></td></tr>`;
      return;
    }
    tbody.innerHTML = doctors.map((d) => `
      <tr>
        <td>${escapeHtml(d.name)}</td>
        <td>${escapeHtml(d.specialty || '—')}</td>
        <td>${escapeHtml(d.days || '—')}</td>
        <td>${escapeHtml(d.phone || '—')}</td>
        <td class="actions">
          <button class="btn btn-ghost btn-small" data-edit-doctor="${d.id}">Edit</button>
          <button class="btn btn-danger btn-small" data-delete-doctor="${d.id}">Delete</button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('[data-edit-doctor]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const d = MDStore.getDoctors().find((x) => x.id === btn.dataset.editDoctor);
        if (!d) return;
        editingDoctorId = d.id;
        docNameEl.value = d.name;
        docSpecialtyEl.value = d.specialty || '';
        docDaysEl.value = d.days || '';
        docPhoneEl.value = d.phone || '';
        docForm.querySelector('h3').textContent = 'Edit doctor';
        docForm.classList.add('show');
        docForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });
    tbody.querySelectorAll('[data-delete-doctor]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (confirm('Delete this doctor?')) {
          MDStore.deleteDoctor(btn.dataset.deleteDoctor);
          renderDoctors();
        }
      });
    });
  }

  // ================= APPOINTMENTS =================
  function renderAppointments() {
    const tbody = document.querySelector('#appointments-table tbody');
    const appts = MDStore.getAppointments();
    if (!appts.length) {
      tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state">No appointments yet — they'll appear here once patients book online.</div></td></tr>`;
      return;
    }
    tbody.innerHTML = appts.map((a) => `
      <tr>
        <td>${escapeHtml(a.name)}</td>
        <td>${escapeHtml(a.phone)}</td>
        <td>${escapeHtml(a.serviceName || '—')}</td>
        <td>${escapeHtml(a.doctorName || 'No preference')}</td>
        <td>${escapeHtml(a.date)}</td>
        <td>${escapeHtml(a.time)}</td>
        <td><span class="status-badge status-${a.status}">${a.status}</span></td>
        <td class="actions">
          ${a.status !== 'confirmed' ? `<button class="btn btn-outline btn-small" data-confirm-appt="${a.id}">Confirm</button>` : ''}
          <button class="btn btn-danger btn-small" data-delete-appt="${a.id}">Delete</button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('[data-confirm-appt]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const appt = MDStore.getAppointments().find((a) => a.id === btn.dataset.confirmAppt);
        MDStore.updateAppointment(btn.dataset.confirmAppt, { status: 'confirmed' });
        renderAppointments();
        if (appt) notifyPatientOnWhatsApp(appt);
      });
    });
    tbody.querySelectorAll('[data-delete-appt]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (confirm('Delete this appointment request?')) {
          MDStore.deleteAppointment(btn.dataset.deleteAppt);
          renderAppointments();
        }
      });
    });
  }

  function normalizePkPhone(raw) {
    // Strips spaces/dashes, converts local "03XXXXXXXXX" to "923XXXXXXXXX" for wa.me links.
    let digits = (raw || '').replace(/[^\d]/g, '');
    if (digits.startsWith('0')) digits = '92' + digits.slice(1);
    if (!digits.startsWith('92')) digits = '92' + digits;
    return digits;
  }

  function notifyPatientOnWhatsApp(appt) {
    const dateDisplay = new Date(appt.date + 'T00:00:00').toLocaleDateString('en-GB', {
      weekday: 'long', day: 'numeric', month: 'long',
    });
    const message = encodeURIComponent(
      `Hi ${appt.name}, your appointment at Marium Dental Surgery is confirmed:\n` +
      `Service: ${appt.serviceName}\n` +
      `${appt.doctorName ? 'Doctor: ' + appt.doctorName + '\n' : ''}` +
      `Date: ${dateDisplay}\nTime: ${appt.time}\n\n` +
      `See you then! Reply here if you need to reschedule.`
    );
    const phone = normalizePkPhone(appt.phone);
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : str;
    return div.innerHTML;
  }
});